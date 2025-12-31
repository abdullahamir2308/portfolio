"""
EMAIL SERVICE - Day 7
Send professional emails with HTML templates
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class EmailService:
    """Email service with SendGrid integration and fallback"""
    
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.email_from = os.getenv("EMAIL_FROM", "portfolio@example.com")
        self.email_to = os.getenv("EMAIL_TO", "user@example.com")
        
        # Initialize SendGrid client if API key exists
        self.sendgrid_client = None
        if self.api_key and self.api_key.startswith("SG."):
            try:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail, Content, To, From
                self.sendgrid_client = SendGridAPIClient(self.api_key)
                logger.info("✅ SendGrid client initialized")
            except ImportError:
                logger.warning("❌ SendGrid not installed. Run: pip install sendgrid")
        else:
            logger.warning("⚠️ No SendGrid API key found. Using file logging.")
    
    def send_portfolio_summary(self, summary_data: Dict) -> Dict:
        """Send portfolio summary email"""
        
        # Create email content
        subject = f"📊 AI Portfolio Summary - {datetime.now().strftime('%Y-%m-%d')}"
        
        # Create HTML template
        html_content = self._create_summary_html(summary_data)
        text_content = self._create_summary_text(summary_data)
        
        # Send email
        result = self._send_email(
            to_email=self.email_to,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
        
        # Log the email
        self._log_email_sent(summary_data, result)
        
        return result
    
    def send_daily_report(self, agent_results: Dict) -> Dict:
        """Send daily AI agent execution report"""
        
        subject = f"🤖 AI Agent Daily Report - {datetime.now().strftime('%Y-%m-%d')}"
        
        # Create report
        html_content = self._create_agent_report_html(agent_results)
        text_content = self._create_agent_report_text(agent_results)
        
        result = self._send_email(
            to_email=self.email_to,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
        
        return result
    
    def _send_email(self, to_email: str, subject: str, 
                   html_content: str, text_content: str) -> Dict:
        """Send email using SendGrid or fallback"""
        
        # Try SendGrid if available
        if self.sendgrid_client:
            try:
                from sendgrid.helpers.mail import Mail, Content, To, From
                
                message = Mail(
                    from_email=From(self.email_from, "AI Portfolio"),
                    to_emails=To(to_email),
                    subject=subject,
                    html_content=Content("text/html", html_content),
                    plain_text_content=Content("text/plain", text_content)
                )
                
                response = self.sendgrid_client.send(message)
                
                return {
                    "status": "sent",
                    "service": "sendgrid",
                    "status_code": response.status_code,
                    "message_id": response.headers.get('X-Message-Id'),
                    "timestamp": datetime.now().isoformat()
                }
                
            except Exception as e:
                logger.error(f"SendGrid error: {e}")
                # Fall through to file logging
        
        # Fallback: Save to file (for development)
        return self._save_email_to_file(to_email, subject, html_content)
    
    def _save_email_to_file(self, to_email: str, subject: str, 
                           html_content: str) -> Dict:
        """Save email to file for development/testing"""
        
        email_data = {
            "to": to_email,
            "subject": subject,
            "html": html_content[:500] + "..." if len(html_content) > 500 else html_content,
            "timestamp": datetime.now().isoformat(),
            "saved_to_file": True
        }
        
        # Save to emails directory
        os.makedirs("emails", exist_ok=True)
        filename = f"emails/email_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump(email_data, f, indent=2)
        
        logger.info(f"📧 Email saved to file: {filename}")
        
        return {
            "status": "saved_to_file",
            "file": filename,
            "timestamp": datetime.now().isoformat(),
            "note": "No SendGrid API key configured. Email saved locally."
        }
    
    def _create_summary_html(self, data: Dict) -> str:
        """Create HTML email template for portfolio summary"""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                .stats {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }}
                .stat-box {{ background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
                .stat-value {{ font-size: 24px; font-weight: bold; color: #4361ee; }}
                .stat-label {{ font-size: 12px; color: #666; margin-top: 5px; }}
                .section {{ margin: 25px 0; }}
                .ai-message {{ background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #4361ee; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }}
                .btn {{ display: inline-block; background: #4361ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤖 AI Portfolio Summary</h1>
                <p>{datetime.now().strftime('%B %d, %Y')}</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2>📊 Daily Overview</h2>
                    <p>Your AI-powered portfolio had activity today. Here's what happened:</p>
                    
                    <div class="stats">
                        <div class="stat-box">
                            <div class="stat-value">{data.get('chat_count', 0)}</div>
                            <div class="stat-label">Chats Today</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">{data.get('agent_tasks', 0)}</div>
                            <div class="stat-label">Agent Tasks</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">{data.get('memory_entries', 0)}</div>
                            <div class="stat-label">Memory Entries</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>🤖 AI Insights</h2>
                    <div class="ai-message">
                        <p>{data.get('ai_summary', 'Your AI assistant has been processing requests and learning from interactions.')}</p>
                    </div>
                </div>
                
                <div class="section">
                    <h2>🚀 Recent Activity</h2>
                    <ul>
                        {self._format_activities(data.get('recent_activities', []))}
                    </ul>
                </div>
                
                <div class="section">
                    <h2>🎯 What's Next?</h2>
                    <p>Based on your learning patterns, consider exploring:</p>
                    <ul>
                        <li><strong>AI Agents:</strong> Extend your agent with new tools</li>
                        <li><strong>Automation:</strong> Add more n8n workflows</li>
                        <li><strong>Frontend:</strong> Enhance the dashboard with charts</li>
                    </ul>
                </div>
                
                <a href="http://localhost:8080" class="btn">View Live Portfolio</a>
                
                <div class="footer">
                    <p>This email was automatically generated by your AI Portfolio system.</p>
                    <p>You're receiving this because you enabled daily summaries.</p>
                    <p><a href="http://localhost:8080#settings" style="color: #4361ee;">Adjust email settings</a></p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _format_activities(self, activities: List[str]) -> str:
        """Format activities list as HTML"""
        if not activities:
            return "<li>No recent activities recorded.</li>"
        
        items = ""
        for activity in activities[:5]:  # Last 5 activities
            items += f"<li>{activity}</li>"
        return items
    
    def _create_summary_text(self, data: Dict) -> str:
        """Create plain text version of summary"""
        return f"""
        AI Portfolio Summary - {datetime.now().strftime('%Y-%m-%d')}
        
        Daily Overview:
        - Chats Today: {data.get('chat_count', 0)}
        - Agent Tasks: {data.get('agent_tasks', 0)}
        - Memory Entries: {data.get('memory_entries', 0)}
        
        AI Insights:
        {data.get('ai_summary', 'Your AI assistant has been processing requests.')}
        
        View your portfolio: http://localhost:8080
        
        This email was automatically generated by your AI Portfolio system.
        """
    
    def _create_agent_report_html(self, agent_results: Dict) -> str:
        """Create HTML report for agent execution"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                .step {{ background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #28a745; }}
                .success {{ color: #28a745; }}
                .error {{ color: #dc3545; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤖 AI Agent Execution Report</h1>
                <p>{datetime.now().strftime('%B %d, %Y %H:%M')}</p>
            </div>
            
            <div class="content">
                <h2>Task: {agent_results.get('task', 'Unknown')}</h2>
                <p><strong>Status:</strong> <span class="{agent_results.get('status', '')}">{agent_results.get('status', '').upper()}</span></p>
                <p><strong>Steps Executed:</strong> {agent_results.get('steps_executed', 0)}</p>
                
                <h3>Execution Steps:</h3>
                {self._format_agent_steps(agent_results.get('results', []))}
                
                <div class="footer">
                    <p>This report was generated automatically by your AI Portfolio system.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _format_agent_steps(self, steps: List[str]) -> str:
        """Format agent steps as HTML"""
        if not steps:
            return "<p>No steps were executed.</p>"
        
        html = ""
        for i, step in enumerate(steps, 1):
            html += f"""
            <div class="step">
                <strong>Step {i}:</strong> {step}
            </div>
            """
        return html
    
    def _create_agent_report_text(self, agent_results: Dict) -> str:
        """Create plain text agent report"""
        return f"""
        AI Agent Execution Report
        
        Task: {agent_results.get('task', 'Unknown')}
        Status: {agent_results.get('status', 'unknown')}
        Steps Executed: {agent_results.get('steps_executed', 0)}
        
        Steps:
        {chr(10).join([f'{i+1}. {step}' for i, step in enumerate(agent_results.get('results', []))])}
        
        Timestamp: {datetime.now().isoformat()}
        """
    
    def _log_email_sent(self, data: Dict, result: Dict):
        """Log email sending for tracking"""
        log_entry = {
            "type": "portfolio_summary",
            "data": {k: v for k, v in data.items() if k not in ['html', 'text']},
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
        os.makedirs("logs", exist_ok=True)
        log_file = f"logs/email_log_{datetime.now().strftime('%Y%m%d')}.json"
        
        # Load existing logs or create new
        logs = []
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                logs = json.load(f)
        
        logs.append(log_entry)
        
        with open(log_file, 'w') as f:
            json.dump(logs, f, indent=2)

# Singleton instance
email_service = EmailService()