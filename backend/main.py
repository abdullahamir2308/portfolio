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
from datetime import datetime, timedelta
import json
from typing import Dict, List
import uuid
from agent_system import PortfolioAgent
import numpy as np
from n8n_integration import router as n8n_router
from email_service import email_service
from github_service import github_service




"""
CHANGES: Add embedding-based memory recall
- Store conversation snippets with embeddings
- Semantic search for relevant memories
- Two memory systems: recent + semantic
"""



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

app.include_router(n8n_router)

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
ai_context = os.getenv("AI_CONTEXT")
# portfolio_context = os.getenv("PORTFOLIO_CONTEXT", "")

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
        You are an AI portfolio assistant. Context: {ai_context}
        You're having a conversation with a visitor.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 6 exchanges)
        if history:
            messages.extend(history[-6:])
        
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
        You are an AI portfolio assistant. Context: {ai_context }
        
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

# Add health check endpoint for n8n
@app.get("/health")
def health_check():
    """Health check for n8n monitoring"""
    return {
        "status": "healthy",
        "service": "AI Portfolio Backend",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "agent": "/agent/task",
            "chat": "/chat",
            "n8n": "/n8n",
            "health": "/health"
        }
    }        


# # email dashboard endpoints
# @app.post("/email/summary")
# async def send_summary_email(email_request: dict = None):
#     """Send portfolio summary email"""
    
#     # Get mock data (in production, fetch from database)
#     summary_data = {
#         "chat_count": len(ConversationMemory.memory.get("default", [])),
#         "agent_tasks": len(agent.memory),
#         "memory_entries": len(embedding_memory.memories.get("texts", [])),
#         "ai_summary": "Your AI portfolio is actively learning and improving. Recent interactions show growing engagement with AI agent features.",
#         "recent_activities": [
#             "AI Agent executed code analysis task",
#             "n8n workflow triggered daily summary",
#             "Semantic memory expanded with new embeddings"
#         ]
#     }
    
#     # Merge with request data if provided
#     if email_request:
#         summary_data.update(email_request)
    
#     result = email_service.send_portfolio_summary(summary_data)
#     return result

# @app.post("/email/agent-report")
# async def send_agent_report(agent_results: dict):
#     """Send AI agent execution report"""
#     result = email_service.send_daily_report(agent_results)
#     return result

# @app.get("/email/logs")
# async def get_email_logs(days: int = 7):
#     """Get recent email logs"""
#     logs = []
#     for i in range(days):
#         date_str = (datetime.now() - timedelta(days=i)).strftime('%Y%m%d')
#         log_file = f"logs/email_log_{date_str}.json"
        
#         if os.path.exists(log_file):
#             with open(log_file, 'r') as f:
#                 day_logs = json.load(f)
#                 logs.extend(day_logs)
    
#     return {
#         "total_emails": len(logs),
#         "emails": logs[-20:]  # Last 20 emails
#     }

# Add to imports
from email_service import email_service

# Add new endpoints
@app.post("/email/summary")
async def send_summary_email(email_request: dict = None):
    """Send portfolio summary email"""
    
    # Get mock data (in production, fetch from database)
    summary_data = {
        "chat_count": len(memory.memories.get("default", [])),
        "agent_tasks": len(agent.memory) if hasattr(agent, 'memory') else 0,
        "memory_entries": len(embedding_memory.memories.get("texts", [])),
        "ai_summary": "Your AI portfolio is actively learning and improving. Recent interactions show growing engagement with AI agent features.",
        "recent_activities": [
            "AI Agent executed code analysis task",
            "n8n workflow triggered daily summary",
            "Semantic memory expanded with new embeddings"
        ]
    }
    
    # Merge with request data if provided
    if email_request:
        summary_data.update(email_request)
    
    result = email_service.send_portfolio_summary(summary_data)
    return result

@app.post("/email/agent-report")
async def send_agent_report(agent_results: dict):
    """Send AI agent execution report"""
    result = email_service.send_daily_report(agent_results)
    return result

@app.get("/email/logs")
async def get_email_logs(days: int = 7):
    """Get recent email logs"""
    logs = []
    for i in range(days):
        date_str = (datetime.now() - timedelta(days=i)).strftime('%Y%m%d')
        log_file = f"logs/email_log_{date_str}.json"
        
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                day_logs = json.load(f)
                logs.extend(day_logs)
    
    return {
        "total_emails": len(logs),
        "emails": logs[-20:]  # Last 20 emails
    }


# github endpoints
@app.get("/github/profile")
async def get_github_profile():
    """Get GitHub user profile"""
    try:
        profile = github_service.get_user_profile()
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/github/repos")
async def get_github_repos():
    """Get GitHub repositories"""
    try:
        repos = github_service.get_repositories()
        return {"repositories": repos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/github/activity")
async def get_github_activity(days: int = 30):
    """Get GitHub activity"""
    try:
        activity = github_service.get_user_activity(days)
        return {"activity": activity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/github/contributions")
async def get_contributions():
    """Get contributions summary"""
    try:
        contributions = github_service.get_contributions_summary()
        return contributions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/github/languages")
async def get_language_stats():
    """Get programming language statistics"""
    try:
        languages = github_service.get_language_stats()
        return languages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/github/repo/{repo_name}")
async def get_repository_details(repo_name: str):
    """Get detailed repository information"""
    try:
        repo_details = github_service.get_repository_details(repo_name)
        return repo_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add health check for GitHub
@app.get("/github/health")
async def github_health():
    """Check GitHub API connectivity"""
    try:
        profile = github_service.get_user_profile()
        return {
            "status": "connected",
            "username": profile.get("login"),
            "rate_limit_remaining": profile.get("rate_limit_remaining", "unknown")
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e)
        }
    

@app.post("/analytics")
async def track_analytics(event: dict):
    """Track analytics events (simple logging for now)"""
    # In production, save to database
    # For now, just log to file
    import json
    from datetime import datetime
    
    log_entry = {
        **event,
        "received_at": datetime.now().isoformat()
    }
    
    # Append to log file
    with open("analytics.log", "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    return {"status": "logged", "event_id": datetime.now().timestamp()}
