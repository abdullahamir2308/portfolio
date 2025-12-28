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
from agent_system import PortfolioAgent
import numpy as np

"""
CHANGES: Add embedding-based memory recall
- Store conversation snippets with embeddings
- Semantic search for relevant memories
- Two memory systems: recent + semantic
"""

import numpy as np


# Add after existing imports
class EmbeddingMemory:
    """Semantic memory using embeddings"""

    def __init__(self, storage_file: str = "semantic_memory.json"):
        self.storage_file = storage_file
        self.client = OpenAI()
        self.memories = self.load_memories()
    
    def load_memories(self):
        """Load semantic memories from file"""
        try:
            with open(self.storage_file, 'r') as f:
                return json.load(f)
        except:
            return {"embeddings": [], "texts": [], "metadata": []}
    
    def save_memories(self):
        """Save memories to file"""
        with open(self.storage_file, 'w') as f:
            json.dump(self.memories, f, indent=2)
    
    def create_embedding(self, text: str):
        """Convert text to embedding vector"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    
    def add_memory(self, text: str, metadata: dict = None):
        """Add text with embedding to memory"""
        embedding = self.create_embedding(text)
        
        self.memories["embeddings"].append(embedding)
        self.memories["texts"].append(text)
        self.memories["metadata"].append(metadata or {})
        
        # Keep only last 50 memories
        if len(self.memories["texts"]) > 50:
            for key in ["embeddings", "texts", "metadata"]:
                self.memories[key] = self.memories[key][-50:]
        
        self.save_memories()
    
    def find_similar(self, query: str, top_k: int = 3):
        """Find most similar memories to query"""
        if not self.memories["embeddings"]:
            return []
        
        query_embedding = self.create_embedding(query)
        similarities = []
        
        for i, emb in enumerate(self.memories["embeddings"]):
            # Simple cosine similarity
            sim = np.dot(query_embedding, emb) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(emb)
            )
            similarities.append((sim, i))
        
        # Sort by similarity (highest first)
        similarities.sort(reverse=True, key=lambda x: x[0])
        
        # Return top matches
        results = []
        for sim, idx in similarities[:top_k]:
            if sim > 0.7:  # Similarity threshold
                results.append({
                    "text": self.memories["texts"][idx],
                    "similarity": float(sim),
                    "metadata": self.memories["metadata"][idx]
                })
        
        return results


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

# Initialize both memory systems
memory = ConversationMemory()
embedding_memory = EmbeddingMemory()

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

# Initialize agent (add after existing client initialization)
agent = PortfolioAgent(client)

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
            model="gpt-4o-mini",
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

# Add this new endpoint
@app.post("/chat_smart")
async def chat_smart(message: Message, session_id: str = "default"):
    """
    Smart chat with both recent and semantic memory
    - Recent: Last 6 messages
    - Semantic: Related past conversations
    """
    try:
        # Get recent conversation history
        recent_history = memory.get_session_history(session_id)
        
        # Get semantically related memories
        semantic_memories = embedding_memory.find_similar(message.content)
        
        # Build enhanced system prompt with memories
        system_prompt = f"""
        You are an AI portfolio assistant. Context: {portfolio_context}
        
        Recent conversation:
        {recent_history[-3:] if recent_history else "No recent conversation"}
        
        Relevant past memories:
        {[m['text'][:100] + '...' for m in semantic_memories[:2]] if semantic_memories else "No relevant memories"}
        
        Instructions:
        1. Answer based on current query and available memories
        2. If memories are relevant, reference them naturally
        3. Keep responses conversational and helpful
        """
        
        # Prepare messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add recent conversation
        if recent_history:
            messages.extend(recent_history[-4:])
        
        # Add current message
        messages.append({"role": "user", "content": message.content})
        
        # Get AI response
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=250,
            temperature=0.8
        )
        
        ai_reply = response.choices[0].message.content
        
        # Store in both memory systems
        memory.add_message(session_id, "user", message.content)
        memory.add_message(session_id, "assistant", ai_reply)
        
        # Store important exchanges in semantic memory
        if len(message.content) > 20:  # Only store substantive messages
            embedding_memory.add_memory(
                text=f"User: {message.content}\nAssistant: {ai_reply}",
                metadata={"session": session_id, "timestamp": datetime.now().isoformat()}
            )
        
        return {
            "reply": ai_reply,
            "session_id": session_id,
            "recent_memory_count": len(memory.get_session_history(session_id)),
            "semantic_matches": len(semantic_memories),
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add endpoint to view semantic memories
@app.get("/semantic_memories")
def get_semantic_memories():
    """Get all semantic memories"""
    return {
        "total_memories": len(embedding_memory.memories["texts"]),
        "sample_memories": embedding_memory.memories["texts"][-5:] if embedding_memory.memories["texts"] else []
    }


# Add new endpoints
@app.post("/agent/task")
async def execute_agent_task(task_request: dict):
    """Execute a task using the AI agent"""
    task = task_request.get("task", "")
    
    if not task:
        raise HTTPException(status_code=400, detail="No task provided")
    
    result = agent.execute_plan(task)
    return result

@app.get("/agent/status")
def get_agent_status():
    """Get current agent status and capabilities"""
    return agent.get_agent_status()

@app.get("/agent/tools")
def get_available_tools():
    """List all available agent tools"""
    return {
        "tools": [
            {
                "name": name,
                "description": tool.description,
                "example": f"Try: 'Use {name} to...'"
            }
            for name, tool in agent.tools.items()
        ]
    }