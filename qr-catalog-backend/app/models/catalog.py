from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Comment(BaseModel):
    user: str
    text: str
    date: datetime = datetime.now()

class Catalog(BaseModel):
    name: str
    file_path: str
    is_active: bool = True
    month: str
    year: int
    likes: int = 0
    comments: List[Comment] = []