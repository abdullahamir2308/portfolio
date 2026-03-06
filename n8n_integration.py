"""
N8N INTEGRATION - Day 6
Creates webhooks for n8n to trigger agent tasks
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import asyncio

router = APIRouter(prefix="/n8n", tags=["automation"])

class N8NTrigger(BaseModel):
    workflow_id: str
    trigger_type: str  # "schedule", "webhook", "manual"
    task_description: str
    parameters: dict = {}

# Store scheduled tasks (in production, use Redis/Database)
scheduled_tasks = {}

@router.post("/webhook/{workflow_name}")
async def n8n_webhook(workflow_name: str, payload: dict):
    """
    Webhook endpoint for n8n to trigger AI agent tasks
    Example: n8n sends POST to http://your-backend:8000/n8n/webhook/daily-summary
    """
    print(f"📨 N8N Webhook received: {workflow_name}")
    
    # Extract task from payload
    task = payload.get("task", f"Automated task from {workflow_name}")
    
    # You could process differently based on workflow
    workflows = {
        "daily-summary": "Create a summary of yesterday's learning progress and portfolio activity",
        "code-review": "Analyze recent code changes and suggest improvements",
        "weekly-report": "Generate weekly progress report with statistics"
    }
    
    agent_task = workflows.get(workflow_name, task)
    
    # Return immediate acknowledgment
    return {
        "status": "triggered",
        "workflow": workflow_name,
        "task": agent_task,
        "timestamp": datetime.now().isoformat(),
        "note": "Task queued for agent execution"
    }

@router.post("/schedule")
async def schedule_agent_task(schedule: dict):
    """
    Schedule recurring agent tasks
    Example: {"task": "Daily summary", "cron": "0 9 * * *", "timezone": "UTC"}
    """
    # Validate cron format (simplified)
    cron_parts = schedule.get("cron", "").split()
    if len(cron_parts) != 5:
        raise HTTPException(status_code=400, detail="Invalid cron format")
    
    task_id = f"task_{datetime.now().timestamp()}"
    scheduled_tasks[task_id] = {
        **schedule,
        "created": datetime.now().isoformat(),
        "next_run": calculate_next_run(schedule["cron"])
    }
    
    return {
        "task_id": task_id,
        "scheduled": scheduled_tasks[task_id],
        "message": f"Task scheduled. Next run: {scheduled_tasks[task_id]['next_run']}"
    }

@router.get("/scheduled")
async def get_scheduled_tasks():
    """List all scheduled tasks"""
    return {
        "count": len(scheduled_tasks),
        "tasks": scheduled_tasks
    }

# Helper to calculate next run from cron
@staticmethod
def calculate_next_run(cron_expression: str) -> str:
    """Simplified next run calculation"""
    # In production, use croniter library
    # For demo, assume daily at 9 AM
    now = datetime.now()
    next_run = now.replace(hour=9, minute=0, second=0, microsecond=0)
    if now.hour >= 9:
        next_run += timedelta(days=1)
    return next_run.isoformat()