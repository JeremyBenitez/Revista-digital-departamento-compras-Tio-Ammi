from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import urllib.parse
from bson import ObjectId
from datetime import datetime
from typing import List
from app.database import connect_to_mongo, close_mongo_connection, db_wrapper

app = FastAPI(title="API Catálogo Tío Ammi - Sistema de Imágenes")

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Configuración de carpeta para guardar imágenes
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


# Montar la carpeta para que las imágenes sean accesibles vía URL
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# --- EVENTOS DE CONEXIÓN ---
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

@app.get("/catalog/current")
async def get_current_catalog():
    """Obtiene el catálogo activo (el último subido)"""
    catalog = await db_wrapper.db.catalogs.find_one({"is_active": True})
    if catalog:
        catalog["_id"] = str(catalog["_id"])
        return catalog
    raise HTTPException(status_code=404, detail="No hay catálogos activos")

@app.get("/catalog/history")
async def get_catalog_history():
    """Obtiene TODOS los catálogos (activos e inactivos)"""
    try:
        # Quitamos {"is_active": False} y ponemos {} para traer todo
        cursor = db_wrapper.db.catalogs.find({}).sort("created_at", -1)
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            history.append(doc)
        return history
    except Exception as e:
        print(f"Error en el historial: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@app.post("/upload-catalog/")
async def upload_catalog(
    name: str = Form(...),
    month: str = Form(...),
    year: int = Form(...),
    files: List[UploadFile] = File(...)
):
    """Sube múltiples imágenes y crea un nuevo catálogo activo"""
    saved_image_paths = []
    
    for file in files:
        safe_filename = file.filename.replace(" ", "_")
        file_location = os.path.join(UPLOAD_DIR, safe_filename)
        
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        saved_image_paths.append(f"/uploads/{safe_filename}")

    # Desactivar todos los catálogos previos
    await db_wrapper.db.catalogs.update_many({}, {"$set": {"is_active": False}})

    new_catalog = {
        "name": name,
        "images": saved_image_paths,
        "is_active": True,
        "month": month,
        "year": year,
        "likes": 0,
        "views": 0,
        "comments": [],
        "created_at": datetime.now()
    }
    
    result = await db_wrapper.db.catalogs.insert_one(new_catalog)
    return {
        "status": "success", 
        "id": str(result.inserted_id),
        "total_images": len(saved_image_paths)
    }

@app.post("/catalog/{catalog_id}/view")
async def register_view(catalog_id: str):
    """Registra una visualización (se llama al cargar la página)"""
    try:
        await db_wrapper.db.catalogs.update_one(
            {"_id": ObjectId(catalog_id)}, 
            {"$inc": {"views": 1}}
        )
        return {"status": "ok"}
    except:
        raise HTTPException(status_code=400, detail="ID de catálogo inválido")

@app.post("/catalog/{catalog_id}/like")
async def add_like(catalog_id: str):
    """Suma un like al catálogo"""
    try:
        await db_wrapper.db.catalogs.update_one(
            {"_id": ObjectId(catalog_id)}, 
            {"$inc": {"likes": 1}}
        )
        return {"status": "liked"}
    except:
        raise HTTPException(status_code=400, detail="ID de catálogo inválido")
    
@app.post("/catalog/{catalog_id}/like-image/{image_index}")
async def like_specific_image(catalog_id: str, image_index: int):
    """Suma un like a una imagen específica dentro de un catálogo"""
    try:
        oid = ObjectId(catalog_id)
        field_name = f"image_likes.{image_index}"
        
        await db_wrapper.db.catalogs.update_one(
            {"_id": oid},
            {"$inc": {field_name: 1}}
        )
        return {"status": "success", "image_index": image_index}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/catalog/{catalog_id}/dislike")
async def add_dislike(catalog_id: str):
    """Suma un dislike al catálogo"""
    try:
        await db_wrapper.db.catalogs.update_one(
            {"_id": ObjectId(catalog_id)}, 
            {"$inc": {"dislikes": 1}} 
        )
        return {"status": "disliked"}
    except:
        raise HTTPException(status_code=400, detail="ID de catálogo inválido")
    
@app.post("/catalog/{catalog_id}/dislike-image/{image_index}")
async def dislike_specific_image(catalog_id: str, image_index: int):
    """Suma un dislike a una imagen específica"""
    try:
        oid = ObjectId(catalog_id)
        # Usamos un campo diferente: 'image_dislikes'
        field_name = f"image_dislikes.{image_index}"
        
        await db_wrapper.db.catalogs.update_one(
            {"_id": oid},
            {"$inc": {field_name: 1}}
        )
        return {"status": "success", "image_index": image_index}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/catalog/{catalog_id}/feedback")
async def add_feedback(
    catalog_id: str,
    rating: int = Form(...),
    comment: str = Form(...)
):
    """Guarda feedback en BD y genera link de WhatsApp"""
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

        # 2. Generar link de WhatsApp
        phone = "584220127002"
        stars = "⭐" * int(rating)
        message = f"¡Hola Tío Ammi! Mi calificación: {stars}. Comentario: {comment}"
        encoded_msg = urllib.parse.quote(message)
        wa_url = f"https://wa.me/{phone}?text={encoded_msg}"
        
        return {"status": "success", "whatsapp_link": wa_url}
    except:
        raise HTTPException(status_code=400, detail="Error al procesar feedback")


@app.delete("/catalog/{catalog_id}")
async def delete_catalog(catalog_id: str):
    try:
        oid = ObjectId(catalog_id)
        
        catalog = await db_wrapper.db.catalogs.find_one({"_id": oid})
        if not catalog:
            raise HTTPException(status_code=404, detail="Catálogo no encontrado")

        await db_wrapper.db.catalogs.delete_one({"_id": oid})
        
        return {"status": "deleted", "message": "Registro eliminado correctamente"}
    except Exception as e:
        print(f"Error al eliminar: {e}")
        raise HTTPException(status_code=400, detail="Error al procesar la eliminación")
    

    