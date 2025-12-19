# from fastapi import FastAPI
# from pydantic import BaseModel
# import os
# from openai import OpenAI
# from dotenv import load_dotenv

# load_dotenv()
# app = FastAPI()

# class Message(BaseModel):
#     content: str

# @app.get("/")
# def home():
#     return {"message": "AI Portfolio Backend Running!"}

# @app.post("/chat")
# async def chat(message: Message):
#     # Simple response for Day 1
#     return {
#         "reply": f"AI Assistant: I received your message: '{message.content}'. Tomorrow I'll get smarter!",
#         "hint": "Tomorrow we connect to real AI models!"
#     }


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List
from datetime import datetime
import json
from typing import Dict, List
import uuid

class ConversationMemory:
    """Simple file-based conversation memory"""
    
    def __init__(self, storage_file: str = "chat_memory.json"):
        self.storage_file = storage_file
        self.memories: Dict[str, List[Dict]] = self.load_memories()
    
    def load_memories(self) -> Dict:
        """Load memories from file"""
        if os.path.exists(self.storage_file):
            with open(self.storage_file, 'r') as f:
                return json.load(f)
        return {}
    
    def save_memories(self):
        """Save memories to file"""
        with open(self.storage_file, 'w') as f:
            json.dump(self.memories, f, indent=2)
    
    def add_message(self, session_id: str, role: str, content: str):
        """Add message to session memory"""
        if session_id not in self.memories:
            self.memories[session_id] = []
        
        self.memories[session_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 12 messages (6 conversations)
        if len(self.memories[session_id]) > 12:
            self.memories[session_id] = self.memories[session_id][-12:]
        
        self.save_memories()
    
    def get_session_history(self, session_id: str) -> List[Dict]:
        """Get conversation history for session"""
        return self.memories.get(session_id, [])

load_dotenv()

app = FastAPI()

# Initialize memory system
memory = ConversationMemory()

# CORS middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
portfolio_context = os.getenv("PORTFOLIO_CONTEXT", "")

class Message(BaseModel):
    content: str
    conversation_history: List[dict] = []

class PortfolioInfo(BaseModel):
    skills: List[str]
    projects: List[str]
    interests: List[str]

@app.get("/")
def home():
    return {
        "name": "AI Portfolio Backend",
        "status": "running",
        "features": ["AI Chat", "Portfolio Analysis", "Real-time Responses"]
    }

@app.get("/portfolio")
def get_portfolio():
    """Returns portfolio information"""
    return {
        "skills": ["Python", "HTML/CSS/JS", "Bootstrap", "FastAPI", "AI/ML Basics"],
        "projects": ["AI-Powered Portfolio (Current)", "Future: Hotel Management System"],
        "interests": ["AI Web Applications", "Automation with n8n", "AI Agents"],
        "education": "3rd Semester CS Student"
    }

# Update the chat endpoint (replace existing /chat endpoint)
@app.post("/chat")
async def chat_with_memory(message: Message, session_id: str = "default"):
    """
    Enhanced chat with memory
    - Uses session_id to remember conversation context
    - Includes last 6 exchanges in AI prompt
    """
    try:
        # Get conversation history for this session
        history = memory.get_session_history(session_id)
        
        # Add user message to memory
        memory.add_message(session_id, "user", message.content)
        
        # Prepare messages for OpenAI with system prompt and history
        system_prompt = f"""
        You are an AI portfolio assistant. Context: {portfolio_context}
        You're having a conversation with a visitor.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 6 exchanges)
        messages.extend(history[-6:]) if history else None
        
        # Add current message
        messages.append({"role": "user", "content": message.content})
        
        # Call OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=200,
            temperature=0.7
        )
        
        ai_reply = response.choices[0].message.content
        
        # Add AI response to memory
        memory.add_message(session_id, "assistant", ai_reply)
        
        return {
            "reply": ai_reply,
            "session_id": session_id,
            "memory_count": len(memory.get_session_history(session_id)),
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add new endpoint to check memory
@app.get("/memory/{session_id}")
def get_memory(session_id: str):
    """Get conversation history for a session"""
    return {
        "session_id": session_id,
        "messages": memory.get_session_history(session_id),
        "total_messages": len(memory.get_session_history(session_id))
    }