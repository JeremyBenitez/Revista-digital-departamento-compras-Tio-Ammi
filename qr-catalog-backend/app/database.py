import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_wrapper = Database()

async def connect_to_mongo():
    uri = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_wrapper.client = AsyncIOMotorClient(uri)
    db_wrapper.db = db_wrapper.client.qr_catalog_db
    print("✅ Conexión establecida con MongoDB LOCAL")

async def close_mongo_connection():
    if db_wrapper.client:
        db_wrapper.client.close()