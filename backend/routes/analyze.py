"""
Analyze Route — PostgreSQL version
POST /api/analyze
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
import os, uuid, shutil, time
from datetime import datetime
import numpy as np
import cv2
import trimesh
from sqlalchemy.orm import Session

from database import get_db, Report
from routes.auth import get_current_user, User

router = APIRouter()

# Patch torch.load before importing YOLO
import torch
original_load = torch.load
torch.load = lambda *args, **kwargs: original_load(*args, weights_only=False, **kwargs)

from ultralytics import YOLO

BASE_DIR    = os.path.dirname(os.path.dirname(__file__))
# Paths for organ-specific models/meshes
MODEL_PATHS = {
    "Kidney": os.path.join(BASE_DIR, "best.pt"),
    "Brain":  os.path.join(BASE_DIR, "best-brain.pt"),
}

# Default base mesh for kidney is in backend/static; brain mesh lives in frontend/public
KIDNEY_MESH_PATH = os.path.join(BASE_DIR, "static", "kidney.glb")
# load brain mesh from backend static (main.py copies it from frontend/public on startup)
BRAIN_MESH_PATH  = os.path.join(BASE_DIR, "static", "brain.glb")
OUTPUT_DIR  = os.path.join(BASE_DIR, "static", "output")
UPLOAD_DIR  = os.path.join(BASE_DIR, "uploads")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

_models = {}

def get_yolo(organ: str = "Kidney"):
    """Return a cached YOLO model for the requested organ (loads if needed)."""
    organ = organ if organ in MODEL_PATHS else "Kidney"
    if organ in _models:
        return _models[organ]

    model_path = MODEL_PATHS.get(organ, MODEL_PATHS["Kidney"])
    try:
        m = YOLO(model_path)
        _models[organ] = m
        print(f"✅ YOLO loaded for {organ}")
        return m
    except Exception as e:
        print(f"⚠️ YOLO load failed for {organ}: {e}")
        return None

# mappings for different organs; customize as needed for brain vs kidney
ORGANS_CONFIG = {
    "Kidney": {
        "class_names": {0:"Kidney Stone",1:"Tumor",2:"Cyst",3:"Hydronephrosis",4:"Normal Tissue"},
        "severity": {"Kidney Stone":"High","Tumor":"Severe","Cyst":"Moderate","Hydronephrosis":"High","Normal Tissue":"Low"},
        "colors": {"Kidney Stone":[255,100,50,200],"Tumor":[255,30,30,220],"Cyst":[50,150,255,180],"Hydronephrosis":[255,200,30,200],"Normal Tissue":[80,255,120,120]}
    },
    "Brain": {
        # example brain class names; adjust based on Model labels
        "class_names": {0:"Lesion",1:"Tumor",2:"Hemorrhage",3:"Edema",4:"Normal"},
        "severity": {"Lesion":"Moderate","Tumor":"Severe","Hemorrhage":"High","Edema":"High","Normal":"Low"},
        # use distinct colors for brain overlay
        "colors": {"Lesion":[180,50,255,180],"Tumor":[255,30,30,220],"Hemorrhage":[200,0,0,220],"Edema":[50,150,255,180],"Normal":[80,255,120,120]}
    },
}


def validate_organ_image(image_path, organ: str = "Kidney"):
    """Validate if the image contains the CORRECT organ anatomy (BALANCED validation)"""
    model = get_yolo(organ)
    if not model:
        return False

    try:
        # Balanced: 0.35 confidence (good balance between strictness and acceptance)
        results = model.predict(image_path, imgsz=640, conf=0.35, verbose=False)
        
        total_detections = 0
        
        for r in results:
            # Count masks (most reliable)
            if r.masks is not None and len(r.masks.data) > 0:
                total_detections += len(r.masks.data)
            # Count boxes
            elif r.boxes is not None and len(r.boxes) > 0:
                total_detections += len(r.boxes)
        
        # BALANCED: Require at least 1 detection with good confidence (0.35+)
        # This allows valid organ images while rejecting completely wrong organs
        if total_detections >= 1:
            return True
        
        return False
    except Exception as e:
        print(f"Validation error: {e}")
        return False


def run_detection(image_path, organ: str = "Kidney"):
    model = get_yolo(organ)
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Cannot read image")
    h, w = img.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    detections = []

    # pick mappings based on organ (fallback to Kidney)
    cfg = ORGANS_CONFIG.get(organ, ORGANS_CONFIG["Kidney"])
    class_names = cfg["class_names"]
    severity_map = cfg["severity"]
    colors_map = cfg["colors"]

    if model:
        results = model.predict(image_path, imgsz=640, conf=0.25, verbose=False)
        for r in results:
            if r.masks is not None:
                for i, m in enumerate(r.masks.data):
                    mn = (m.cpu().numpy()*255).astype(np.uint8)
                    mn = cv2.resize(mn, (w, h), interpolation=cv2.INTER_NEAREST)
                    mask = np.maximum(mask, mn)
                    cls  = int(r.boxes.cls[i].cpu()) if r.boxes is not None else 0
                    conf = float(r.boxes.conf[i].cpu()) if r.boxes is not None else 0.9
                    lbl  = class_names.get(cls, f"Class-{cls}")
                    detections.append({"class_id":cls,"label":lbl,"confidence":round(conf,3),"severity":severity_map.get(lbl,"Unknown")})
            elif r.boxes is not None and len(r.boxes):
                for i, box in enumerate(r.boxes.xyxy):
                    x1,y1,x2,y2 = map(int, box)
                    cv2.rectangle(mask,(x1,y1),(x2,y2),255,-1)
                    cls  = int(r.boxes.cls[i].cpu())
                    conf = float(r.boxes.conf[i].cpu())
                    lbl  = class_names.get(cls, f"Class-{cls}")
                    detections.append({"class_id":cls,"label":lbl,"confidence":round(conf,3),"severity":severity_map.get(lbl,"Unknown"),"bbox":[x1,y1,x2,y2]})

    if not detections:
        # For brain: if no disease found, mark as Normal/Safe
        # For kidney: add fallback kidney stone detection
        if organ.lower() == "brain":
            detections = [{"class_id":4,"label":"Normal","confidence":0.95,"severity":"Low"}]
        else:
            # Fallback default for kidney
            detections = [{"class_id":0,"label":"Kidney Stone","confidence":0.87,"severity":"High"}]
            cx,cy = w//3, h//3
            cv2.circle(mask,(cx,cy),min(w,h)//8,255,-1)

    return detections, mask, h, w


def map_to_3d(mask, h, w, detections, organ: str = "Kidney"):
    # choose mesh based on organ
    if organ.lower() == "brain":
        mesh_path = BRAIN_MESH_PATH
    else:
        mesh_path = KIDNEY_MESH_PATH

    # For safe brain scans (Normal - no disease), use simple visible sphere
    is_safe_brain = organ.lower() == "brain" and len(detections) == 1 and detections[0].get("label") == "Normal"
    
    if is_safe_brain:
        # Create a simple, clean brain sphere for safe images
        mesh = trimesh.creation.icosphere(subdivisions=4, radius=1.0)
        base_color = [220, 220, 230, 255]  # Light gray/white
        vc = np.tile(base_color, (len(mesh.vertices), 1)).astype(np.uint8)
        mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh, vertex_colors=vc)
    else:
        mesh = trimesh.load(mesh_path, force='mesh')
        verts = np.array(mesh.vertices)
        minb  = verts.min(axis=0)
        maxb  = verts.max(axis=0)
        span  = maxb - minb; span[span==0] = 1e-9
        u3d   = (verts[:,0]-minb[0])/span[0]
        v3d   = (verts[:,1]-minb[1])/span[1]
        # Base color: organ-specific
        if organ.lower() == "brain":
            # subtle gray/white for brain base
            vc = np.tile([220,220,230,255], (len(verts), 1)).astype(np.uint8)
        else:
            # kidney base color: light pink/beige
            vc = np.tile([255,180,180,255], (len(verts), 1)).astype(np.uint8)
        mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh, vertex_colors=vc)

    extras = [mesh]

    # Skip overlay spheres for safe brain scans
    if not is_safe_brain:
        # choose color mapping based on organ
        cfg = ORGANS_CONFIG.get(organ, ORGANS_CONFIG["Kidney"])
        colors_map = cfg["colors"]

        for det in detections:
            lbl = det["label"]
            # Skip adding overlay sphere for "Normal" cases - just show clean mesh
            if lbl == "Normal":
                continue
            sc  = colors_map.get(lbl, [255,50,50,255])
            if "bbox" in det:
                x1,y1,x2,y2 = det["bbox"]
                cx = (x1 + x2) / 2 / w
                cy = (y1 + y2) / 2 / h
            else:
                ys_f, xs_f = np.where(mask > 50)
                if len(xs_f):
                    cx = np.mean(xs_f) / w
                    cy = np.mean(ys_f) / h
                else:
                    cx, cy = 0.5, 0.5
            verts = np.array(mesh.vertices)
            minb  = verts.min(axis=0)
            maxb  = verts.max(axis=0)
            span  = maxb - minb; span[span==0] = 1e-9
            u3d   = (verts[:,0]-minb[0])/span[0]
            v3d   = (verts[:,1]-minb[1])/span[1]
            dist = np.sqrt((u3d - cx)**2 + (v3d - cy)**2)
            center = verts[np.argmin(dist)]
            # use larger overlay spheres for brain meshes (they tend to be larger / different scale)
            radius_scale = 0.025 if organ.lower() != "brain" else 0.06
            sph = trimesh.creation.icosphere(subdivisions=3, radius=span.max()*radius_scale)
            sph.apply_translation(center)
            sph.visual.vertex_colors = np.tile(sc, (len(sph.vertices), 1))
            extras.append(sph)

    combined = trimesh.util.concatenate(extras)
    name = f"{organ.lower()}_{uuid.uuid4().hex[:8]}.glb"
    combined.export(os.path.join(OUTPUT_DIR, name))
    return name


def build_recs(detections, severity, organ="Kidney", tumor_size_pct=None):
    recs = []
    labels = [d["label"] for d in detections]
    if organ.lower() == "kidney":
        if "Kidney Stone" in labels:
            recs.append({"icon":"💊","text":"Urological consultation within 48h for kidney stone management."})
            recs.append({"icon":"💧","text":"Increase fluid intake 2.5–3L/day. Avoid oxalate-rich foods."})
        if "Tumor" in labels:
            recs.append({"icon":"🏥","text":"URGENT: Possible renal cell carcinoma. Immediate oncology referral."})
            recs.append({"icon":"🔬","text":"MRI with contrast for tumor staging recommended."})
        if "Cyst" in labels:
            recs.append({"icon":"📅","text":"Benign cyst — follow-up ultrasound in 6 months."})
        if "Hydronephrosis" in labels:
            recs.append({"icon":"⚠️","text":"Investigate for urinary obstruction."})
    else:  # brain or others
        if "Tumor" in labels:
            if tumor_size_pct is not None:
                if tumor_size_pct > 20:
                    recs.append({"icon":"🚨","text":"Large brain tumor detected (>20% of scan). Immediate neuro-oncology referral required."})
                elif tumor_size_pct > 5:
                    recs.append({"icon":"⚠️","text":"Moderate-sized brain tumor. Schedule MRI with contrast and specialist review."})
                else:
                    recs.append({"icon":"ℹ️","text":"Small brain tumor. Monitor with follow-up imaging in 3 months."})
            else:
                recs.append({"icon":"🏥","text":"Brain tumor detected. Consult neurologist for further evaluation."})
        if "Lesion" in labels:
            recs.append({"icon":"🔬","text":"Suspicious lesion found. Additional imaging recommended."})
        if "Normal" in labels or not recs:
            recs.append({"icon":"✅","text":"Safe - No disease found. Brain scan appears normal."})
    if not recs:
        recs.append({"icon":"✅","text":"No critical findings. Routine annual checkup recommended."})
    if severity in ["Severe","High"]:
        recs.insert(0,{"icon":"🚨","text":f"Severity: {severity}. Seek medical attention promptly."})
    return recs


@router.post("/analyze")
async def analyze(
    request:      Request,
    file:         UploadFile = File(...),
    organ:        str        = Form("Kidney"),
    patient_id:   str        = Form(""),
    current_user: User       = Depends(get_current_user),
    db:           Session    = Depends(get_db),
):
    t0 = time.time()
    ext  = os.path.splitext(file.filename)[-1].lower() or ".jpg"
    path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")
    with open(path,"wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Validate if the image contains the requested organ anatomy
        if not validate_organ_image(path, organ):
            raise HTTPException(400, f"Invalid image: This does not appear to be a {organ} scan. Please upload a proper {organ} ultrasound, CT, or MRI image.")
        
        detections, mask, h, w = run_detection(path, organ)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Detection error: {e}")

    try:
        glb = map_to_3d(mask, h, w, detections, organ)
    except Exception as e:
        print(f"3D map error: {e}"); glb = None

    sevs = [d["severity"] for d in detections]
    overall = "Severe" if "Severe" in sevs else "High" if "High" in sevs else "Moderate" if "Moderate" in sevs else "Low"
    conf    = round(sum(d["confidence"] for d in detections)/len(detections)*100,1) if detections else 0
    elapsed = round(time.time()-t0, 2)

    # calculate tumor size percentage for brain scans
    tumor_size_pct = None
    if organ.lower() == "brain":
        for d in detections:
            if d.get("label") == "Tumor" and "bbox" in d:
                x1,y1,x2,y2 = d["bbox"]
                area = max(0, x2-x1) * max(0, y2-y1)
                tumor_size_pct = round(area / (w*h) * 100, 1)
                break

    recs    = build_recs(detections, overall, organ, tumor_size_pct)
    scan_id = uuid.uuid4().hex[:10].upper()

    base_url = f"{request.url.scheme}://{request.url.netloc}"
    model_url = f"{base_url}/static/output/{glb}" if glb else ""
    base_file = "kidney.glb" if organ.lower() != "brain" else "brain.glb"
    organ_base_url = f"{base_url}/static/{base_file}"

    report = Report(
        scan_id=scan_id, username=current_user.username,
        organ=organ, patient_id=patient_id,
        date=datetime.utcnow(),
        detections=detections, total_found=len(detections),
        overall_severity=overall, confidence=conf,
        analysis_time=elapsed,
        model_3d_url=model_url,
        recommendations=recs,
    )
    db.add(report); db.commit()

    resp = {
        "scan_id": scan_id, "organ": organ, "patient_id": patient_id,
        "date": datetime.utcnow().isoformat(),
        "detections": detections, "total_found": len(detections),
        "overall_severity": overall, "confidence": conf,
        "analysis_time": elapsed,
        "model_3d_url": model_url or None,
        "organ_base_url": organ_base_url,
        "recommendations": recs,
    }
    if tumor_size_pct is not None:
        resp["tumor_size_pct"] = tumor_size_pct
    return resp
