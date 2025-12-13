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

load_dotenv()

app = FastAPI()

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

@app.post("/chat")
async def chat_with_ai(message: Message):
    """Enhanced AI chat with context"""
    try:
        # Build conversation context
        system_prompt = f"""
        You are an AI assistant for a portfolio website. 
        Context about the portfolio owner: {portfolio_context}
        
        Your responses should:
        1. Be helpful and enthusiastic about their skills/projects
        2. Keep responses concise (2-3 sentences max)
        3. If asked about skills/projects, reference the portfolio info
        4. Encourage questions about their work
        """
        
        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history if provided
        if message.conversation_history:
            messages.extend(message.conversation_history[-6:])  # Last 6 messages for context
        
        # Add current message
        messages.append({"role": "user", "content": message.content})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Use gpt-4 if you have access
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        
        ai_reply = response.choices[0].message.content
        
        return {
            "reply": ai_reply,
            "status": "success",
            "model": "gpt-3.5-turbo"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")