from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from bson import ObjectId
from datetime import datetime
from app.database import connect_to_mongo, close_mongo_connection, db_wrapper

app = FastAPI(title="QR Catalog API - Tío Ammi")

# --- CONFIGURACIÓN DE SEGURIDAD ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear carpeta uploads si no existe
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {"status": "online", "db": "qr_catalog_db"}

@app.get("/catalog/current")
async def get_current_catalog():
    catalog = await db_wrapper.db.catalogs.find_one({"is_active": True})
    if catalog:
        catalog["_id"] = str(catalog["_id"])
        return catalog
    raise HTTPException(status_code=404, detail="No hay catálogo activo. ¡Sube uno primero!")

@app.post("/upload-catalog/")
async def upload_catalog(
    name: str = Form(...),
    month: str = Form(...),
    year: int = Form(...),
    file: UploadFile = File(...)
):
    # 1. Guardar archivo
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    # 2. Desactivar anteriores
    await db_wrapper.db.catalogs.update_many({}, {"$set": {"is_active": False}})

    # 3. Insertar nuevo
    new_catalog = {
        "name": name,
        "pdf_url": f"/uploads/{file.filename}",
        "is_active": True,
        "month": month,
        "year": year,
        "stats": {"views": 0, "likes": 0},
        "created_at": datetime.now()
    }
    
    result = await db_wrapper.db.catalogs.insert_one(new_catalog)
    return {"message": "Éxito", "id": str(result.inserted_id)}