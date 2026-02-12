"""
JOB SEARCH SERVICE - Day 13
Integration with job boards (LinkedIn/Indeed) for automated job discovery
"""

import os
import requests
import json
from typing import Dict, List, Optional
from datetime import datetime
import logging
from dotenv import load_dotenv

load_dotenv()

class JobSearchService:
    """Service for searching jobs from various platforms"""
    
    def __init__(self):
        self.linkedin_token = os.getenv("LINKEDIN_TOKEN", "")
        self.indeed_publisher_id = os.getenv("INDEED_PUBLISHER_ID", "")
        
        # Cache for search results
        self.search_cache = {}
        self.cache_duration = 3600  # 1 hour
        
    def search_linkedin(self, query: str, location: str = "", limit: int = 10) -> List[Dict]:
        """Search jobs on LinkedIn (requires LinkedIn API access)"""
        
        # Note: LinkedIn API requires business verification
        # This is a placeholder for when you get LinkedIn API access
        
        if not self.linkedin_token:
            return self._get_linkedin_mock_data(query, location, limit)
        
        try:
            # LinkedIn API endpoint (simplified)
            headers = {
                "Authorization": f"Bearer {self.linkedin_token}",
                "Content-Type": "application/json"
            }
            
            params = {
                "keywords": query,
                "location": location,
                "count": limit,
                "sort": "R"
            }
            
            # This would be the real API call
            # response = requests.get(
            #     "https://api.linkedin.com/v2/jobSearch",
            #     headers=headers,
            #     params=params
            # )
            
            # For now, return mock data
            return self._get_linkedin_mock_data(query, location, limit)
            
        except Exception as e:
            logging.error(f"LinkedIn search error: {e}")
            return self._get_linkedin_mock_data(query, location, limit)
    
    def search_indeed(self, query: str, location: str = "", limit: int = 10) -> List[Dict]:
        """Search jobs on Indeed (requires Indeed Publisher ID)"""
        
        if not self.indeed_publisher_id:
            return self._get_indeed_mock_data(query, location, limit)
        
        try:
            # Indeed API endpoint
            params = {
                "publisher": self.indeed_publisher_id,
                "q": query,
                "l": location,
                "limit": limit,
                "format": "json",
                "v": "2"
            }
            
            response = requests.get(
                "http://api.indeed.com/ads/apisearch",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                jobs = []
                
                for result in data.get("results", []):
                    job = {
                        "source": "indeed",
                        "job_id": result.get("jobkey"),
                        "title": result.get("jobtitle"),
                        "company": result.get("company"),
                        "location": result.get("formattedLocation"),
                        "description": result.get("snippet", ""),
                        "url": result.get("url"),
                        "date": result.get("date"),
                        "salary": result.get("salary"),
                        "remote": "remote" in result.get("formattedLocation", "").lower()
                    }
                    jobs.append(job)
                
                return jobs
            else:
                logging.error(f"Indeed API error: {response.status_code}")
                return self._get_indeed_mock_data(query, location, limit)
                
        except Exception as e:
            logging.error(f"Indeed search error: {e}")
            return self._get_indeed_mock_data(query, location, limit)
    
    def search_all_platforms(self, query: str, location: str = "", limit: int = 5) -> Dict[str, List]:
        """Search all available job platforms"""
        
        cache_key = f"{query}_{location}_{limit}"
        
        # Check cache
        if cache_key in self.search_cache:
            cached_data, timestamp = self.search_cache[cache_key]
            if datetime.now().timestamp() - timestamp < self.cache_duration:
                return cached_data
        
        results = {
            "linkedin": self.search_linkedin(query, location, limit),
            "indeed": self.search_indeed(query, location, limit),
            "total": 0,
            "query": query,
            "location": location,
            "searched_at": datetime.now().isoformat()
        }
        
        # Calculate total
        results["total"] = len(results["linkedin"]) + len(results["indeed"])
        
        # Update cache
        self.search_cache[cache_key] = (results, datetime.now().timestamp())
        
        return results
    
    def get_recommended_jobs(self, skills: List[str], preferred_locations: List[str] = None) -> List[Dict]:
        """Get recommended jobs based on skills and preferences"""
        
        if not preferred_locations:
            preferred_locations = ["Remote", "Pakistan"]
        
        recommended = []
        
        # Create queries based on skills with their mapping
        skill_queries = [
            (skill, f"{skill} developer") for skill in skills[:3]
        ]
        
        # Add generic queries
        generic_queries = [
            (None, "AI developer"),
            (None, "web developer internship"),
            (None, "python developer")
        ]
        
        all_queries = skill_queries + generic_queries
        
        for skill, query in all_queries:
            for location in preferred_locations:
                try:
                    results = self.search_all_platforms(query, location, limit=2)
                    
                    # Flatten results
                    for platform, jobs in results.items():
                        if platform not in ["total", "query", "location", "searched_at"]:
                            for job in jobs:
                                # Set recommended reason based on skill match
                                if skill:
                                    job["recommended_reason"] = f"Matches your {skill} skill"
                                else:
                                    job["recommended_reason"] = "Recommended for your profile"
                                recommended.append(job)
                except Exception as e:
                    logging.error(f"Error searching for {query}: {e}")
                    continue
        
        # Remove duplicates by job_id
        unique_jobs = {}
        for job in recommended:
            job_id = job.get("job_id") or f"{job.get('title')}_{job.get('company')}"
            if job_id not in unique_jobs:
                unique_jobs[job_id] = job
        
        # Convert to list and limit to top 15
        jobs_list = list(unique_jobs.values())
        return jobs_list[:15]
    
    def _get_linkedin_mock_data(self, query: str, location: str, limit: int) -> List[Dict]:
        """Generate mock LinkedIn job data for development"""
        
        mock_jobs = [
            {
                "source": "linkedin",
                "job_id": f"linkedin_{datetime.now().timestamp()}_{i}",
                "title": f"{query.capitalize()} Developer",
                "company": ["TechCorp", "AI Innovations", "WebSolutions", "DataSystems"][i % 4],
                "location": location or "Remote",
                "description": f"We're looking for a skilled {query} developer to join our team. Experience with modern web technologies and AI integration required.",
                "url": "https://linkedin.com/jobs/view/123456",
                "date": "2 days ago",
                "remote": True,
                "easy_apply": True,
                "seniority_level": ["Entry level", "Associate"][i % 2]
            }
            for i in range(min(limit, 5))
        ]
        
        return mock_jobs
    
    def _get_indeed_mock_data(self, query: str, location: str, limit: int) -> List[Dict]:
        """Generate mock Indeed job data for development"""
        
        mock_jobs = [
            {
                "source": "indeed",
                "job_id": f"indeed_{datetime.now().timestamp()}_{i}",
                "title": f"{query} Engineer",
                "company": ["InnovateTech", "Digital Solutions", "AI Ventures", "WebCraft"][i % 4],
                "location": location or "Karachi, Pakistan",
                "description": f"Join our team as a {query} engineer. Must have experience with Python, JavaScript, and modern frameworks.",
                "url": "https://indeed.com/viewjob?jk=123456",
                "date": "1 week ago",
                "salary": "$40,000 - $60,000 a year",
                "remote": i % 3 == 0
            }
            for i in range(min(limit, 5))
        ]
        
        return mock_jobs

# Singleton instance
job_search_service = JobSearchService()