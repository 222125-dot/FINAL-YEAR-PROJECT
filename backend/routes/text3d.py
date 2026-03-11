"""
Text to 3D — Pre-loaded models based on keywords
POST /api/text3d/generate
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os, uuid, shutil
from sqlalchemy.orm import Session
from datetime import datetime

from routes.auth import get_current_user, User
from database import get_db

router    = APIRouter()
OUT_DIR   = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "output")
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "public")
os.makedirs(OUT_DIR, exist_ok=True)


class T3DRequest(BaseModel):
    prompt: str
    style:  str = "medical"


# Mapping of keywords to model files
MODEL_MAPPING = {
    "kidney": {
        "files": ["kidney.glb", "kidney_model.obj"],
        "description": "3D model kidney",
        "organ_type": "kidney",
        "anomalies": []
    },
    "brain": {
        "files": ["brain.glb", "brain.fbx"],
        "description": "3D model of a human brain",
        "organ_type": "brain",
        "anomalies": []
    },
    "Heart": {
        "files": ["human_heart.glb"],
        "description": "human heart",
        "organ_type": "heart",
        "anomalies": []
    },
    "liver": {
        "files": ["liver_organ.glb"],
        "description": "3D model of a human liver",
        "organ_type": "liver",
        "anomalies": []
    },
    "lung": {
        "files": ["lungs.glb", "lungs.gltf"],
        "description": "3D model of human lungs",
        "organ_type": "lung",
        "anomalies": []
    },
    "intestine": {
        "files": ["intestine.glb"],
        "description": "3D model of human intestine",
        "organ_type": "intestine",
        "anomalies": []
    },
    "body": {
        "files": ["humanbody-anatomical structure.glb"],
        "description": "3D model of human body anatomical structure",
        "organ_type": "body",
        "anomalies": []
    },
    "hand": {
        "files": ["a_3d_model_of_lower_hand.glb"],
        "description": "3D model of lower hand",
        "organ_type": "hand",
        "anomalies": []
    }
}


def find_matching_model(prompt):
    prompt_lower = prompt.lower()
    for keyword, model_data in MODEL_MAPPING.items():
        if keyword in prompt_lower:
            return model_data
    # Default to kidney if no match
    return MODEL_MAPPING["Heart"]


def copy_model_to_output(model_data):
    for filename in model_data["files"]:
        src_path = os.path.join(PUBLIC_DIR, filename)
        if os.path.exists(src_path):
            # Copy to output directory with unique name
            ext = os.path.splitext(filename)[1]
            unique_name = f"t3d_{uuid.uuid4().hex[:8]}{ext}"
            dst_path = os.path.join(OUT_DIR, unique_name)
            shutil.copy2(src_path, dst_path)
            return unique_name
    return None


@router.post("/generate")
def generate(req: T3DRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.prompt.strip():
        raise HTTPException(400, "Prompt is empty")
    
    model_data = find_matching_model(req.prompt)
    glb = copy_model_to_output(model_data)
    
    if not glb:
        raise HTTPException(500, "No matching 3D model found")
    
    return {
        "model_url": f"http://localhost:8000/static/output/{glb}",
        "description": model_data["description"],
        "organ_type": model_data["organ_type"],
        "anomalies": model_data["anomalies"],
        "prompt": req.prompt,
    }
