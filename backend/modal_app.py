import modal  # pyright: ignore[reportMissingImports]
import os
import sys
from pathlib import Path

# Add the backend directory to the path
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

app = modal.App("visio3d-backend")
visio3d_secrets = modal.Secret.from_name("visio3d-secrets")

# Create an image with all required dependencies
requirements_path = Path(__file__).with_name("requirements.txt")
image = (
    modal.Image.debian_slim()
    .pip_install_from_requirements(str(requirements_path))
    .add_local_dir(str(BACKEND_DIR), remote_path="/root/backend")
)


@app.function(image=image, secrets=[visio3d_secrets])
def run_backend():
    """Run the Visio3D FastAPI backend on a remote worker."""
    import os
    import sys
    import uvicorn
    from pathlib import Path

    os.chdir("/root/backend")
    sys.path.insert(0, str(Path.cwd()))
    from main import app as fastapi_app
    
    print("🚀 Starting Visio3D Backend on remote worker...")
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8000)


@app.local_entrypoint()
def main():
    """Start the backend on Modal."""
    print("Starting Visio3D Backend on Modal...")
    run_backend.remote()
