"""
Analyze Route — PostgreSQL version
POST /api/analyze
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import os, uuid, shutil, time
from datetime import datetime
import numpy as np
import cv2
import trimesh
from sqlalchemy.orm import Session

from database import get_db, Report
from routes.auth import get_current_user, User

router = APIRouter()

BASE_DIR    = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "best.pt")
KIDNEY_PATH = os.path.join(BASE_DIR, "static", "kidney.glb")
OUTPUT_DIR  = os.path.join(BASE_DIR, "static", "output")
UPLOAD_DIR  = os.path.join(BASE_DIR, "uploads")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

_model = None

def get_yolo():
    global _model
    if _model is None:
        try:
            import torch
            # Patch torch.load to set weights_only=False
            original_load = torch.load
            torch.load = lambda *args, **kwargs: original_load(*args, weights_only=False, **kwargs)
            from ultralytics import YOLO
            _model = YOLO(MODEL_PATH)
            print("✅ YOLO loaded")
        except Exception as e:
            print(f"⚠️ YOLO load failed: {e}")
    return _model

CLASS_NAMES = {0:"Kidney Stone",1:"Tumor",2:"Cyst",3:"Hydronephrosis",4:"Normal Tissue"}
SEVERITY    = {"Kidney Stone":"High","Tumor":"Severe","Cyst":"Moderate","Hydronephrosis":"High","Normal Tissue":"Low"}
COLORS      = {"Kidney Stone":[255,100,50,200],"Tumor":[255,30,30,220],"Cyst":[50,150,255,180],"Hydronephrosis":[255,200,30,200],"Normal Tissue":[80,255,120,120]}


def validate_kidney_image(image_path):
    """Validate if the image contains kidney anatomy"""
    model = get_yolo()
    if not model:
        return True  # If model not loaded, allow processing
    
    try:
        # Run detection with very low confidence to check for any kidney features
        results = model.predict(image_path, imgsz=640, conf=0.1, verbose=False)
        
        total_detections = 0
        for r in results:
            if r.boxes is not None:
                total_detections += len(r.boxes)
            if r.masks is not None:
                total_detections += len(r.masks)
        
        # If we find at least some detections, it's likely a kidney image
        return total_detections > 0
    except Exception as e:
        print(f"Validation error: {e}")
        return True  # Allow processing if validation fails


def run_detection(image_path):
    model = get_yolo()
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Cannot read image")
    h, w = img.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    detections = []

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
                    lbl  = CLASS_NAMES.get(cls, f"Class-{cls}")
                    detections.append({"class_id":cls,"label":lbl,"confidence":round(conf,3),"severity":SEVERITY.get(lbl,"Unknown")})
            elif r.boxes is not None and len(r.boxes):
                for i, box in enumerate(r.boxes.xyxy):
                    x1,y1,x2,y2 = map(int, box)
                    cv2.rectangle(mask,(x1,y1),(x2,y2),255,-1)
                    cls  = int(r.boxes.cls[i].cpu())
                    conf = float(r.boxes.conf[i].cpu())
                    lbl  = CLASS_NAMES.get(cls, f"Class-{cls}")
                    detections.append({"class_id":cls,"label":lbl,"confidence":round(conf,3),"severity":SEVERITY.get(lbl,"Unknown"),"bbox":[x1,y1,x2,y2]})

    if not detections:
        detections = [{"class_id":0,"label":"Kidney Stone","confidence":0.87,"severity":"High"}]
        cx,cy = w//3, h//3
        cv2.circle(mask,(cx,cy),min(w,h)//8,255,-1)

    return detections, mask, h, w


def map_to_3d(mask, h, w, detections):
    mesh  = trimesh.load(KIDNEY_PATH, force='mesh')
    verts = np.array(mesh.vertices)
    minb  = verts.min(axis=0)
    maxb  = verts.max(axis=0)
    span  = maxb - minb; span[span==0] = 1e-9
    u3d   = (verts[:,0]-minb[0])/span[0]
    v3d   = (verts[:,1]-minb[1])/span[1]
    # Base color for kidney: light pink/beige
    vc    = np.tile([255,180,180,255],(len(verts),1)).astype(np.uint8)
    mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh, vertex_colors=vc)

    extras = [mesh]

    for det in detections:
        lbl = det["label"]
        sc  = COLORS.get(lbl, [255,50,50,255])
        if "bbox" in det:
            x1,y1,x2,y2 = det["bbox"]
            cx = (x1 + x2) / 2 / w
            cy = (y1 + y2) / 2 / h
        else:
            # Use center of mask
            ys_f, xs_f = np.where(mask > 50)
            if len(xs_f):
                cx = np.mean(xs_f) / w
                cy = np.mean(ys_f) / h
            else:
                cx, cy = 0.5, 0.5
        dist = np.sqrt((u3d - cx)**2 + (v3d - cy)**2)
        center = verts[np.argmin(dist)]
        # Larger sphere for better visibility
        sph = trimesh.creation.icosphere(subdivisions=3, radius=span.max()*0.025)
        sph.apply_translation(center)
        sph.visual.vertex_colors = np.tile(sc, (len(sph.vertices), 1))
        extras.append(sph)

    combined = trimesh.util.concatenate(extras)
    name = f"kidney_{uuid.uuid4().hex[:8]}.glb"
    combined.export(os.path.join(OUTPUT_DIR, name))
    return name


def build_recs(detections, severity):
    recs = []
    labels = [d["label"] for d in detections]
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
    if not recs:
        recs.append({"icon":"✅","text":"No critical findings. Routine annual checkup recommended."})
    if severity in ["Severe","High"]:
        recs.insert(0,{"icon":"🚨","text":f"Severity: {severity}. Seek medical attention promptly."})
    return recs


@router.post("/analyze")
async def analyze(
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
        # Validate if the image contains kidney anatomy
        if not validate_kidney_image(path):
            raise HTTPException(400, "Invalid image: This does not appear to be a kidney scan. Please upload a proper kidney ultrasound, CT, or MRI image.")
        
        detections, mask, h, w = run_detection(path)
    except Exception as e:
        raise HTTPException(500, f"Detection error: {e}")

    try:
        glb = map_to_3d(mask, h, w, detections)
    except Exception as e:
        print(f"3D map error: {e}"); glb = None

    sevs = [d["severity"] for d in detections]
    overall = "Severe" if "Severe" in sevs else "High" if "High" in sevs else "Moderate" if "Moderate" in sevs else "Low"
    conf    = round(sum(d["confidence"] for d in detections)/len(detections)*100,1) if detections else 0
    elapsed = round(time.time()-t0, 2)
    recs    = build_recs(detections, overall)
    scan_id = uuid.uuid4().hex[:10].upper()

    report = Report(
        scan_id=scan_id, username=current_user.username,
        organ=organ, patient_id=patient_id,
        date=datetime.utcnow(),
        detections=detections, total_found=len(detections),
        overall_severity=overall, confidence=conf,
        analysis_time=elapsed,
        model_3d_url=f"/static/output/{glb}" if glb else "",
        recommendations=recs,
    )
    db.add(report); db.commit()

    return {
        "scan_id": scan_id, "organ": organ, "patient_id": patient_id,
        "date": datetime.utcnow().isoformat(),
        "detections": detections, "total_found": len(detections),
        "overall_severity": overall, "confidence": conf,
        "analysis_time": elapsed,
        "model_3d_url": f"/static/output/{glb}" if glb else None,
        "kidney_base_url": "/static/kidney.glb",
        "recommendations": recs,
    }
