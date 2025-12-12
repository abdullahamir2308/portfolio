from fastapi import FastAPI
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

class Message(BaseModel):
    content: str

@app.get("/")
def home():
    return {"message": "AI Portfolio Backend Running!"}

@app.post("/chat")
async def chat(message: Message):
    # Simple response for Day 1
    return {
        "reply": f"AI Assistant: I received your message: '{message.content}'. Tomorrow I'll get smarter!",
        "hint": "Tomorrow we connect to real AI models!"
    }