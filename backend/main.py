"""
Visio3D Backend — FastAPI + PostgreSQL
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn, os, shutil
from dotenv import load_dotenv

load_dotenv()

from database import init_db
from routes import auth, analyze, reports, text3d

app = FastAPI(title="Visio3D API", version="2.0.0")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── STATIC FILES ─────────────────────────────────────────────────────────────
os.makedirs("static", exist_ok=True)
os.makedirs("static/output", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

# Copy GLB models to static on startup
for src_name in ["kidney.glb", "human_base_mesh_male.glb"]:
    src = src_name
    dst = os.path.join("static", src_name)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy(src, dst)
        print(f"📦 Copied {src_name} to static/")

app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── ROUTES ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(analyze.router, prefix="/api",         tags=["Analyze"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(text3d.router,  prefix="/api/text3d",  tags=["Text3D"])


@app.get("/")
def root():
    return {
        "message": "✅ Visio3D API running",
        "docs":    "http://localhost:8000/docs",
        "status":  "ok"
    }


@app.on_event("startup")
def startup():
    print("🚀 Visio3D starting up...")
    try:
        init_db()
    except Exception as e:
        print(f"⚠️ DB init error: {e}")
        print("Make sure PostgreSQL is running and DATABASE_URL is correct in .env")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
