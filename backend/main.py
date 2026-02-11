from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp_client import mcp_router, lifespan

app = FastAPI(lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mcp_router, prefix="/api")

from pydantic import BaseModel
class ChatRequest(BaseModel):
    messages: list

import orchestrator

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    response = await orchestrator.chat_with_llm(request.messages)
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}
