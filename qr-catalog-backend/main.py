from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import urllib.parse
from bson import ObjectId
from datetime import datetime
from typing import List
from fastapi.responses import FileResponse

# Importaciones de tu estructura de carpetas
from app.database import connect_to_mongo, close_mongo_connection, db_wrapper
from app.models.catalog import Catalog, Comment

app = FastAPI(title="API Catálogo Tío Ammi - Sistema de Imágenes")

from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="API Catálogo",
        version="1.0.0",
        description="Sistema de carga de catálogos",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS ---
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- EVENTOS DE CICLO DE VIDA ---
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# --- RUTAS DEL SISTEMA ---

@app.get("/")
async def root():
    return {"status": "online", "message": "Backend Tío Ammi Funcionando"}

@app.get("/admin")
async def serve_admin():
    return FileResponse("admin.html")

@app.get("/catalog/current")
async def get_current_catalog():
    catalog = await db_wrapper.db.catalogs.find_one({"is_active": True})
    if catalog:
        catalog["_id"] = str(catalog["_id"])
        return catalog
    raise HTTPException(status_code=404, detail="No hay catálogos activos")

@app.get("/catalog/history")
async def get_catalog_history():
    try:
        cursor = db_wrapper.db.catalogs.find({}).sort("created_at", -1)
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            history.append(doc)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")

@app.post("/upload-catalog/")
async def upload_catalog(
    name: str = Form(...),
    month: str = Form(...),
    year: int = Form(...),
    files: list[UploadFile] = File(...),
    video: UploadFile = File(None)
): 
    print(f"--- Recibiendo catálogo: {name} ---") # VALIDACIÓN 1
    try:
        saved_image_paths = []
        for file in files:
            print(f"Procesando imagen: {file.filename}")
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_image_paths.append(f"/{UPLOAD_DIR}/{file.filename}")

        video_path = None
        if video and video.filename:
            video_filename = f"vid_{datetime.now().timestamp()}_{video.filename.replace(' ', '_')}"
            video_location = os.path.join(UPLOAD_DIR, video_filename)
            with open(video_location, "wb+") as video_object:
                shutil.copyfileobj(video.file, video_object)
            video_path = f"/uploads/{video_filename}"

        await db_wrapper.db.catalogs.update_many({}, {"$set": {"is_active": False}})

        images_with_stats = [
                {"url": path, "likes": 0, "dislikes": 0} 
                for path in saved_image_paths
            ]

        new_catalog = {
                "name": name,
                "images": images_with_stats,
                "video_url": {
                    "url": video_path, 
                    "likes": 0, 
                    "dislikes": 0
                } if video_path else None,
                "is_active": True,
                "month": month,
                "year": year,
                "views": 0,
                "comments": [],
                "created_at": datetime.now()
            }
        
        result = await db_wrapper.db.catalogs.insert_one(new_catalog)
        return {
            "status": "success", 
            "id": str(result.inserted_id)
        }

    except Exception as e:
            print(f"❌ ERROR CRÍTICO: {str(e)}") # Esto saldrá en tu terminal de VS Code
            raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/catalog/{catalog_id}/view")
async def register_view(catalog_id: str):
    try:
        await db_wrapper.db.catalogs.update_one(
            {"_id": ObjectId(catalog_id)}, 
            {"$inc": {"views": 1}}
        )
        return {"status": "ok"}
    except Exception:
        raise HTTPException(status_code=400, detail="ID de catálogo inválido")
#==========================================================================================================
@app.post("/catalog/{catalog_id}/react")
async def register_reaction(
    catalog_id: str, 
    file_url: str = Form(...), 
    type: str = Form(...) # "like" o "dislike"
):
    try:
        oid = ObjectId(catalog_id)
        field = "likes" if type == "like" else "dislikes"
        
        # 1. Intentar actualizar si es una imagen dentro del array
        result = await db_wrapper.db.catalogs.update_one(
            {"_id": oid, "images.url": file_url},
            {"$inc": {f"images.$.{field}": 1}}
        )
        
        # 2. Si no encontró imagen, intentar actualizar si es el video
        if result.modified_count == 0:
            await db_wrapper.db.catalogs.update_one(
                {"_id": oid, "video_url.url": file_url},
                {"$inc": {f"video_url.{field}": 1}}
            )
            
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
#==========================================================================================================
@app.post("/catalog/{catalog_id}/feedback")
async def add_feedback(
    catalog_id: str,
    rating: int = Form(...),
    comment: str = Form(...)
):
    try:
        oid = ObjectId(catalog_id)
        feedback_entry = {
            "rating": rating,
            "comment": comment,
            "date": datetime.now()
        }
        await db_wrapper.db.catalogs.update_one(
            {"_id": oid},
            {"$push": {"comments": feedback_entry}}
        )
        phone = "584220127002"
        stars = "⭐" * int(rating)
        message = f"¡Hola Tío Ammi! Mi calificación: {stars}. Comentario: {comment}"
        encoded_msg = urllib.parse.quote(message)
        wa_url = f"https://wa.me/{phone}?text={encoded_msg}"
        return {"status": "success", "whatsapp_link": wa_url}
    except Exception:
        raise HTTPException(status_code=400, detail="Error al procesar el feedback")

@app.delete("/catalog/{catalog_id}")
async def delete_catalog(catalog_id: str):
    try:
        oid = ObjectId(catalog_id)
        result = await db_wrapper.db.catalogs.delete_one({"_id": oid})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Catálogo no encontrado")
        return {"status": "deleted", "message": "Registro eliminado correctamente"}
    except Exception:
        raise HTTPException(status_code=400, detail="Error al procesar la eliminación")