"""
Visio3D Backend — FastAPI + PostgreSQL
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn, os, shutil, time, logging
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

from database import init_db
from routes import auth, analyze, reports, text3d, queries

# ─── LOGGING (Reliability: error detection & monitoring) ──────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("visio3d")

app = FastAPI(title="Visio3D API", version="2.0.0")

# ─── PERFORMANCE: GZip compression for faster response delivery ───────────────
app.add_middleware(GZipMiddleware, minimum_size=500)

# ─── SECURITY: Security headers middleware ────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

# ─── RELIABILITY: Request timing & logging middleware ─────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round(time.time() - start, 3)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}s)")
    return response

# ─── SECURITY: Rate limiting for auth endpoints (brute-force protection) ──────
_rate_limiter: dict = defaultdict(list)
RATE_LIMIT_WINDOW = 60    # seconds
RATE_LIMIT_MAX    = 10    # max attempts per window

@app.middleware("http")
async def rate_limit_auth(request: Request, call_next):
    if request.url.path.startswith("/api/auth/") and request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        # Clean old entries
        _rate_limiter[client_ip] = [t for t in _rate_limiter[client_ip] if now - t < RATE_LIMIT_WINDOW]
        if len(_rate_limiter[client_ip]) >= RATE_LIMIT_MAX:
            logger.warning(f"Rate limit exceeded for {client_ip} on {request.url.path}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many attempts. Please wait a minute and try again."}
            )
        _rate_limiter[client_ip].append(now)
    return await call_next(request)

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

# Also copy brain model if it's available in the frontend public folder
brain_src_frontend = os.path.normpath(os.path.join("..", "frontend", "public", "brain.glb"))
brain_dst = os.path.join("static", "brain.glb")
if os.path.exists(brain_src_frontend) and not os.path.exists(brain_dst):
    shutil.copy(brain_src_frontend, brain_dst)
    print("📦 Copied brain.glb to static/")

app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── ROUTES ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(analyze.router, prefix="/api",         tags=["Analyze"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(text3d.router,  prefix="/api/text3d",  tags=["Text3D"])
app.include_router(queries.router, prefix="/api/queries", tags=["Queries"])


@app.get("/")
def root():
    return {
        "message": "✅ Visio3D API running",
        "docs":    "http://localhost:8000/docs",
        "status":  "ok"
    }

# ─── RELIABILITY: Health check endpoint for monitoring ────────────────────────
@app.get("/api/health")
def health_check():
    """Health check — used by frontend to detect backend availability."""
    return {"status": "healthy", "timestamp": time.time()}

# ─── RELIABILITY: Global exception handler (graceful failure) ─────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )


@app.on_event("startup")
def startup():
    logger.info("🚀 Visio3D starting up...")
    try:
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"⚠️ DB init error: {e}")
        logger.error("Make sure PostgreSQL is running and DATABASE_URL is correct in .env")
    
    # PERFORMANCE: Preload YOLO models on startup (avoid cold-start delay)
    from routes.analyze import get_yolo
    get_yolo("Kidney")
    get_yolo("Brain")
    logger.info("✅ YOLO models preloaded")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
