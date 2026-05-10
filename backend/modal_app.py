import modal
from pathlib import Path

BACKEND_DIR = Path(__file__).parent

app = modal.App("visio3d-backend")
visio3d_secrets = modal.Secret.from_name("visio3d-secrets")

image = (
    modal.Image.debian_slim()
    .pip_install_from_requirements(str(BACKEND_DIR / "requirements.txt"))
    .add_local_dir(str(BACKEND_DIR), remote_path="/root/backend")
)

# ─── ASGI APP (exposes a real HTTPS endpoint at *.modal.run) ──────────────────
# Using @modal.asgi_app() is the correct way to serve FastAPI on Modal.
# This gives you a stable URL like:
#   https://<your-workspace>--visio3d-backend-fastapi-app.modal.run
# Use that URL as VITE_API_URL in Vercel. Do NOT use the Modal dashboard URL.
@app.function(
    image=image,
    secrets=[visio3d_secrets],
    # Increase timeout for long-running requests (e.g. YOLO inference)
    timeout=120,
    # Keep one container warm to avoid cold-start delays
    min_containers=1,
)
@modal.asgi_app()
def fastapi_app():
    import os, sys
    from pathlib import Path

    os.chdir("/root/backend")
    sys.path.insert(0, str(Path.cwd()))

    from main import app as _app
    return _app


# ─── LOCAL ENTRYPOINT (for testing: `modal run modal_app.py`) ─────────────────
@app.local_entrypoint()
def main():
    print("✅ Deploy with:  modal deploy modal_app.py")
    print("   After deploy, grab your .modal.run URL and set it as:")
    print("   VITE_API_URL in your Vercel project environment variables.")