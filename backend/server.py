from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT and Password Config
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Predefined tasks for new clients
PREDEFINED_TASKS = [
    "Create website",
    "Check mobile view",
    "Create Razorpay account",
    "Set up domain",
    "Configure email",
    "Add payment gateway",
    "Test functionality",
    "Deploy to production",
    "Set up analytics",
    "Create documentation",
    "Client training"
]

# ============= Models =============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ClientCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    title: str
    description: Optional[str] = ""
    status: str = "pending"  # pending or completed
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TaskCreate(BaseModel):
    client_id: str
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "pending"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    username: str
    text: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CommentCreate(BaseModel):
    task_id: str
    text: str

# ============= Auth Utilities =============
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# ============= Auth Routes =============
@api_router.post("/auth/register", response_model=Token)
async def register(user_input: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_input.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(username=user_input.username, email=user_input.email)
    user_doc = user.model_dump()
    user_doc["password_hash"] = get_password_hash(user_input.password)
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_input: UserLogin):
    user_doc = await db.users.find_one({"email": user_input.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user_input.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**{k: v for k, v in user_doc.items() if k != "password_hash"})
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============= Client Routes =============
@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: User = Depends(get_current_user)):
    clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    return clients

@api_router.post("/clients", response_model=Client)
async def create_client(client_input: ClientCreate, current_user: User = Depends(get_current_user)):
    client = Client(
        name=client_input.name,
        description=client_input.description,
        created_by=current_user.id
    )
    client_doc = client.model_dump()
    await db.clients.insert_one(client_doc)
    
    # Create predefined tasks for this client
    for idx, task_title in enumerate(PREDEFINED_TASKS):
        task = Task(
            client_id=client.id,
            title=task_title,
            description="",
            status="pending",
            order=idx
        )
        await db.tasks.insert_one(task.model_dump())
    
    return client

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_input: ClientUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in client_input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.clients.update_one({"id": client_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    return Client(**client)

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: User = Depends(get_current_user)):
    # Delete client
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Delete all tasks for this client
    await db.tasks.delete_many({"client_id": client_id})
    
    # Delete all comments for tasks of this client
    tasks = await db.tasks.find({"client_id": client_id}, {"_id": 0, "id": 1}).to_list(1000)
    task_ids = [task["id"] for task in tasks]
    await db.comments.delete_many({"task_id": {"$in": task_ids}})
    
    return {"message": "Client deleted successfully"}

# ============= Task Routes =============
@api_router.get("/tasks/{client_id}", response_model=List[Task])
async def get_tasks(client_id: str, current_user: User = Depends(get_current_user)):
    tasks = await db.tasks.find({"client_id": client_id}, {"_id": 0}).sort("order", 1).to_list(1000)
    return tasks

@api_router.post("/tasks", response_model=Task)
async def create_task(task_input: TaskCreate, current_user: User = Depends(get_current_user)):
    # Get max order for this client
    tasks = await db.tasks.find({"client_id": task_input.client_id}, {"_id": 0, "order": 1}).to_list(1000)
    max_order = max([t["order"] for t in tasks], default=-1)
    
    task = Task(
        client_id=task_input.client_id,
        title=task_input.title,
        description=task_input.description,
        status=task_input.status,
        order=max_order + 1
    )
    await db.tasks.insert_one(task.model_dump())
    return task

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_input: TaskUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in task_input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return Task(**task)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete all comments for this task
    await db.comments.delete_many({"task_id": task_id})
    
    return {"message": "Task deleted successfully"}

# ============= Comment Routes =============
@api_router.get("/comments/{task_id}", response_model=List[Comment])
async def get_comments(task_id: str, current_user: User = Depends(get_current_user)):
    comments = await db.comments.find({"task_id": task_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return comments

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_input: CommentCreate, current_user: User = Depends(get_current_user)):
    comment = Comment(
        task_id=comment_input.task_id,
        user_id=current_user.id,
        username=current_user.username,
        text=comment_input.text
    )
    await db.comments.insert_one(comment.model_dump())
    return comment

@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, current_user: User = Depends(get_current_user)):
    comment = await db.comments.find_one({"id": comment_id}, {"_id": 0})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only allow user to delete their own comments
    if comment["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    await db.comments.delete_one({"id": comment_id})
    return {"message": "Comment deleted successfully"}

# ============= App Setup =============
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()