"""
JOB SERVICE - Phase 1
Core job application tracking and AI analysis
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional
from openai import OpenAI
import logging
from dotenv import load_dotenv

load_dotenv()

class JobService:
    """Service for job application tracking and AI assistance"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.jobs_file = "job_applications.json"
        self.resumes_file = "resume_data.json"
        self.load_data()
    
    def load_data(self):
        """Load job applications and resume data"""
        # Job applications
        if os.path.exists(self.jobs_file):
            with open(self.jobs_file, 'r') as f:
                self.jobs = json.load(f)
        else:
            self.jobs = []
        
        # Resume data
        if os.path.exists(self.resumes_file):
            with open(self.resumes_file, 'r') as f:
                self.resume_data = json.load(f)
        else:
            self.resume_data = {
                "skills": ["Python", "JavaScript", "FastAPI", "AI Integration", "Automation"],
                "experience": "3rd semester CS student with AI portfolio project experience",
                "education": "Computer Science Student"
            }
    
    def save_data(self):
        """Save all data to files"""
        with open(self.jobs_file, 'w') as f:
            json.dump(self.jobs, f, indent=2)
        
        with open(self.resumes_file, 'w') as f:
            json.dump(self.resume_data, f, indent=2)
    
    def add_job_application(self, job_data: Dict) -> Dict:
        """Add a new job application"""
        job = {
            "id": f"job_{datetime.now().timestamp()}",
            "company": job_data.get("company", ""),
            "position": job_data.get("position", ""),
            "job_url": job_data.get("job_url", ""),
            "description": job_data.get("description", ""),
            "applied_date": datetime.now().isoformat(),
            "status": "applied",  # applied, interviewed, rejected, offer
            "notes": job_data.get("notes", ""),
            "next_follow_up": job_data.get("next_follow_up", ""),
            "resume_version": job_data.get("resume_version", "default"),
            "cover_letter": job_data.get("cover_letter", ""),
            "last_updated": datetime.now().isoformat()
        }
        
        self.jobs.append(job)
        self.save_data()
        
        # Auto-analyze job match
        analysis = self.analyze_job_match(job)
        job["analysis"] = analysis
        
        return {"job": job, "analysis": analysis}
    
    def analyze_job_match(self, job: Dict) -> Dict:
        """AI analysis of job match with resume"""
        try:
            prompt = f"""
            Analyze this job posting for a CS student with these skills: {self.resume_data['skills']}
            
            Job Position: {job.get('position', '')}
            Company: {job.get('company', '')}
            Description: {job.get('description', '')[:500]}
            
            Provide analysis with:
            1. Match score (0-100) based on skills alignment
            2. 3 key skills required that match the student's skills
            3. 2 potential skill gaps
            4. 3 keywords to add to resume for this job
            5. Confidence level (Low/Medium/High)
            
            Return JSON format:
            {{
                "match_score": 85,
                "matching_skills": ["Python", "AI", "FastAPI"],
                "skill_gaps": ["Cloud Experience", "Team Leadership"],
                "keywords": ["machine learning", "API development", "automation"],
                "confidence": "Medium",
                "suggestions": ["Emphasize AI projects", "Add cloud coursework"]
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a career advisor helping a CS student optimize job applications."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            analysis = json.loads(response.choices[0].message.content)
            return analysis
            
        except Exception as e:
            logging.error(f"Job analysis error: {e}")
            return {
                "match_score": 50,
                "matching_skills": [],
                "skill_gaps": ["Analysis unavailable"],
                "keywords": [],
                "confidence": "Low",
                "suggestions": ["Error in analysis"]
            }
    
    def tailor_resume_for_job(self, job_id: str) -> Dict:
        """Generate resume tailoring suggestions for a specific job"""
        job = next((j for j in self.jobs if j["id"] == job_id), None)
        if not job:
            return {"error": "Job not found"}
        
        try:
            prompt = f"""
            Given this job description:
            Position: {job.get('position', '')}
            Company: {job.get('company', '')}
            Description: {job.get('description', '')[:1000]}
            
            And this student's profile:
            Skills: {self.resume_data['skills']}
            Experience: {self.resume_data['experience']}
            Education: {self.resume_data['education']}
            
            Provide specific resume tailoring advice:
            1. Which skills to emphasize (top 5)
            2. Which projects to highlight
            3. Keywords to include from job description
            4. Suggested resume summary/bio
            5. Formatting suggestions
            
            Return JSON format:
            {{
                "skills_to_emphasize": ["Python", "AI Integration"],
                "projects_to_highlight": ["AI Portfolio"],
                "keywords": ["machine learning", "web development"],
                "suggested_summary": "CS student specializing in...",
                "formatting_tips": ["Put skills section first", "Quantify achievements"]
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a resume expert helping a student tailor their resume."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.4
            )
            
            tailoring = json.loads(response.choices[0].message.content)
            return tailoring
            
        except Exception as e:
            logging.error(f"Resume tailoring error: {e}")
            return {"error": "Failed to generate tailoring suggestions"}
    
    def update_application_status(self, job_id: str, status: str, notes: str = "") -> Dict:
        """Update job application status"""
        job = next((j for j in self.jobs if j["id"] == job_id), None)
        if not job:
            return {"error": "Job not found"}
        
        job["status"] = status
        job["notes"] = notes
        job["last_updated"] = datetime.now().isoformat()
        self.save_data()
        
        return {"success": True, "job": job}
    
    def get_job_stats(self) -> Dict:
        """Get job application statistics"""
        if not self.jobs:
            return {
                "total_applications": 0,
                "by_status": {},
                "match_score_avg": 0,
                "last_30_days": 0
            }
        
        # Count by status
        status_counts = {}
        for job in self.jobs:
            status = job.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Calculate average match score
        scores = [job.get("analysis", {}).get("match_score", 50) for job in self.jobs]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Count last 30 days
        thirty_days_ago = datetime.now().timestamp() - (30 * 24 * 60 * 60)
        recent_apps = sum(1 for job in self.jobs 
                         if datetime.fromisoformat(job.get("applied_date", "")).timestamp() > thirty_days_ago)
        
        return {
            "total_applications": len(self.jobs),
            "by_status": status_counts,
            "match_score_avg": round(avg_score, 1),
            "last_30_days": recent_apps,
            "companies_applied": len(set(j.get("company", "") for j in self.jobs))
        }
    
    def generate_cover_letter(self, job_id: str) -> Dict:
        """Generate a cover letter for a job application"""
        job = next((j for j in self.jobs if j["id"] == job_id), None)
        if not job:
            return {"error": "Job not found"}
        
        try:
            prompt = f"""
            Write a professional cover letter for this job application:
            
            Position: {job.get('position', 'Software Developer')}
            Company: {job.get('company', 'Tech Company')}
            
            Applicant is a Computer Science student with these skills: {self.resume_data['skills']}
            Experience: {self.resume_data['experience']}
            
            Job Description Context: {job.get('description', '')[:800]}
            
            Write a 3-paragraph cover letter that:
            1. Shows enthusiasm for the specific role and company
            2. Highlights 2-3 relevant skills/projects
            3. Expresses eagerness to contribute and learn
            
            Make it professional but not overly formal. Tailor it to the job description.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional cover letter writer for tech students."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            cover_letter = response.choices[0].message.content
            
            # Update job with cover letter
            job["cover_letter"] = cover_letter
            job["last_updated"] = datetime.now().isoformat()
            self.save_data()
            
            return {
                "success": True,
                "cover_letter": cover_letter,
                "job_id": job_id
            }
            
        except Exception as e:
            logging.error(f"Cover letter generation error: {e}")
            return {"error": "Failed to generate cover letter"}

# Singleton instance
job_service = JobService()