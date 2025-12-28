"""
AI AGENT SYSTEM - Day 5 Implementation
An autonomous agent that can use tools to accomplish tasks
Architecture: Perceive → Plan → Act → Learn
"""

import json
from datetime import datetime
from typing import Dict, List, Callable, Any
from enum import Enum

class AgentStatus(Enum):
    THINKING = "thinking"
    ACTING = "acting"
    COMPLETED = "completed"
    ERROR = "error"

class Tool:
    """Base class for agent tools"""
    
    def __init__(self, name: str, description: str, function: Callable):
        self.name = name
        self.description = description
        self.function = function
    
    def execute(self, **kwargs) -> str:
        """Execute tool with given parameters"""
        try:
            result = self.function(**kwargs)
            return f"Tool {self.name} executed successfully: {result}"
        except Exception as e:
            return f"Error executing {self.name}: {str(e)}"

class PortfolioAgent:
    """Your first AI agent - can automate portfolio tasks"""
    
    def __init__(self, openai_client):
        self.client = openai_client
        self.status = AgentStatus.THINKING
        self.tools = self._register_tools()
        self.memory = []  # Agent's working memory
        self.max_steps = 5  # Prevent infinite loops
        
    def _register_tools(self) -> Dict[str, Tool]:
        """Register all available tools for the agent"""
        
        # Tool 1: Summarize Text
        def summarize_tool(text: str, max_length: int = 200) -> str:
            """Summarize any text concisely"""
            prompt = f"Summarize this text in {max_length} characters or less:\n\n{text}"
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )
            return response.choices[0].message.content
        
        # Tool 2: Analyze Code
        def analyze_code_tool(code: str, language: str = "python") -> str:
            """Analyze code for bugs, style, or improvements"""
            prompt = f"""Analyze this {language} code:
            {code}
            
            Provide:
            1. Potential bugs
            2. Style improvements
            3. Optimization suggestions
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300
            )
            return response.choices[0].message.content
        
        # Tool 3: Generate Documentation
        def generate_docs_tool(code: str) -> str:
            """Generate documentation for code snippets"""
            prompt = f"""Generate clean documentation for this code:
            {code}
            
            Include:
            - Function description
            - Parameters
            - Return value
            - Example usage
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=250
            )
            return response.choices[0].message.content
        
        # Tool 4: Portfolio Statistics
        def portfolio_stats_tool() -> Dict[str, Any]:
            """Get portfolio usage statistics"""
            # This would connect to your database in production
            return {
                "total_chats": len(self.memory),
                "active_sessions": 1,
                "memory_usage": f"{len(json.dumps(self.memory))} bytes",
                "tools_used": len([m for m in self.memory if "executed tool" in m]),
                "timestamp": datetime.now().isoformat()
            }
        
        # Tool 5: Learning Progress Tracker
        def learning_tracker_tool(topic: str, hours: float) -> str:
            """Track learning progress for a topic"""
            progress_entry = {
                "topic": topic,
                "hours_studied": hours,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "timestamp": datetime.now().isoformat()
            }
            
            # In production, save to database
            self.memory.append(f"Learning tracked: {topic} - {hours} hours")
            
            return f"Tracked {hours} hours of {topic} study. Keep going!"
        
        # Register all tools
        return {
            "summarize": Tool("summarize", "Summarize any text", summarize_tool),
            "analyze_code": Tool("analyze_code", "Analyze code for improvements", analyze_code_tool),
            "generate_docs": Tool("generate_docs", "Generate documentation for code", generate_docs_tool),
            "portfolio_stats": Tool("portfolio_stats", "Get portfolio statistics", portfolio_stats_tool),
            "learning_tracker": Tool("learning_tracker", "Track learning progress", learning_tracker_tool)
        }
    
    def plan_action(self, task: str) -> List[Dict]:
        """Break down task into step-by-step plan"""
        
        planning_prompt = f"""
        You are an AI agent that can use tools. The user requested: "{task}"
        
        Available tools:
        {chr(10).join([f"- {name}: {tool.description}" for name, tool in self.tools.items()])}
        
        Break this task into steps. Each step should:
        1. Use ONE tool from above
        2. Specify the exact parameters
        
        Respond in JSON format:
        {{
            "steps": [
                {{
                    "step": 1,
                    "tool": "tool_name",
                    "parameters": {{"param1": "value1"}},
                    "reason": "Why this step is needed"
                }}
            ]
        }}
        """
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": planning_prompt}],
            response_format={"type": "json_object"}
        )
        
        plan = json.loads(response.choices[0].message.content)
        return plan.get("steps", [])
    
    def execute_plan(self, task: str) -> Dict[str, Any]:
        """Execute the entire plan for a task"""
        
        self.status = AgentStatus.THINKING
        self.memory.append(f"Starting task: {task}")
        
        # Generate plan
        steps = self.plan_action(task)
        
        if not steps:
            self.status = AgentStatus.ERROR
            return {"error": "Failed to create plan", "steps": []}
        
        results = []
        
        # Execute each step
        for i, step in enumerate(steps[:self.max_steps]):
            self.status = AgentStatus.ACTING
            step_num = i + 1
            
            tool_name = step.get("tool")
            if tool_name not in self.tools:
                results.append(f"Step {step_num}: Unknown tool '{tool_name}'")
                continue
            
            # Execute tool
            tool = self.tools[tool_name]
            params = step.get("parameters", {})
            
            try:
                result = tool.execute(**params)
                results.append(f"Step {step_num}: {result}")
                self.memory.append(f"Executed {tool_name}: {result[:100]}...")
            except Exception as e:
                results.append(f"Step {step_num}: Error - {str(e)}")
        
        self.status = AgentStatus.COMPLETED
        self.memory.append(f"Completed task: {task}")
        
        return {
            "task": task,
            "status": self.status.value,
            "steps_executed": len(results),
            "results": results,
            "agent_memory": self.memory[-5:]  # Last 5 entries
        }
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get current agent status and capabilities"""
        return {
            "status": self.status.value,
            "available_tools": list(self.tools.keys()),
            "memory_entries": len(self.memory),
            "recent_memory": self.memory[-3:] if self.memory else [],
            "max_steps": self.max_steps,
            "timestamp": datetime.now().isoformat()
        }