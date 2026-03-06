"""
GITHUB SERVICE - Day 8
Fetch and analyze GitHub data for portfolio
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from dotenv import load_dotenv

load_dotenv()

class GitHubService:
    """Service to interact with GitHub API"""
    
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.username = os.getenv("GITHUB_USERNAME")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        # Cache for frequent requests
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes
        
    def _make_request(self, endpoint: str, use_cache: bool = True) -> Dict:
        """Make authenticated request to GitHub API"""
        cache_key = endpoint
        
        # Check cache
        if use_cache and cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if datetime.now().timestamp() - timestamp < self.cache_timeout:
                return cached_data
        
        url = f"{self.base_url}{endpoint}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            # Update cache
            self.cache[cache_key] = (data, datetime.now().timestamp())
            return data
        else:
            raise Exception(f"GitHub API error: {response.status_code} - {response.text}")
    
    def get_user_profile(self) -> Dict:
        """Get GitHub user profile"""
        return self._make_request("/user")
    
    def get_repositories(self) -> List[Dict]:
        """Get user repositories (including private if token has access)"""
        repos = self._make_request(f"/users/{self.username}/repos?per_page=100")
        
        # Sort by last updated
        repos.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
        return repos
    
    def get_repository_languages(self, repo_name: str) -> Dict:
        """Get programming languages used in a repository"""
        return self._make_request(f"/repos/{self.username}/{repo_name}/languages")
    
    def get_user_activity(self, days: int = 30) -> List[Dict]:
        """Get user activity events"""
        # Calculate date range
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        events = self._make_request(f"/users/{self.username}/events?per_page=100")
        
        # Filter by date and type
        filtered_events = []
        for event in events:
            event_date = datetime.strptime(event['created_at'], '%Y-%m-%dT%H:%M:%SZ')
            if event_date >= datetime.now() - timedelta(days=days):
                filtered_events.append(event)
        
        return filtered_events
    
    def get_commit_history(self, repo_name: str) -> List[Dict]:
        """Get commit history for a repository"""
        commits = self._make_request(f"/repos/{self.username}/{repo_name}/commits?per_page=50")
        return commits
    
    def get_contributions_summary(self) -> Dict:
        """Get contributions summary (commits, PRs, issues, etc.)"""
        events = self.get_user_activity(days=90)
        
        summary = {
            "total_events": len(events),
            "push_events": 0,
            "pull_request_events": 0,
            "issue_events": 0,
            "create_events": 0,
            "delete_events": 0,
            "commit_count": 0,
            "repos_contributed_to": set(),
            "last_90_days": {}
        }
        
        # Count events by type and date
        for event in events:
            event_type = event['type']
            event_date = event['created_at'][:10]  # YYYY-MM-DD
            
            # Initialize date in summary
            if event_date not in summary["last_90_days"]:
                summary["last_90_days"][event_date] = {
                    "pushes": 0,
                    "pull_requests": 0,
                    "issues": 0,
                    "commits": 0
                }
            
            # Count by type
            if event_type == "PushEvent":
                summary["push_events"] += 1
                summary["last_90_days"][event_date]["pushes"] += 1
                summary["commit_count"] += event['payload'].get('size', 0)
                
                # Track repos
                repo_name = event['repo']['name']
                summary["repos_contributed_to"].add(repo_name)
                
            elif event_type == "PullRequestEvent":
                summary["pull_request_events"] += 1
                summary["last_90_days"][event_date]["pull_requests"] += 1
            elif event_type == "IssuesEvent":
                summary["issue_events"] += 1
                summary["last_90_days"][event_date]["issues"] += 1
            elif event_type == "CreateEvent":
                summary["create_events"] += 1
            elif event_type == "DeleteEvent":
                summary["delete_events"] += 1
        
        summary["repos_contributed_to"] = list(summary["repos_contributed_to"])
        summary["repos_contributed_count"] = len(summary["repos_contributed_to"])
        
        return summary
    
    def get_language_stats(self) -> Dict:
        """Get programming language statistics across all repos"""
        repos = self.get_repositories()
        language_stats = {}
        
        for repo in repos:
            if not repo['fork']:  # Only non-forked repos
                repo_name = repo['name']
                try:
                    languages = self.get_repository_languages(repo_name)
                    
                    for lang, bytes_count in languages.items():
                        language_stats[lang] = language_stats.get(lang, 0) + bytes_count
                except:
                    continue
        
        # Calculate percentages
        total_bytes = sum(language_stats.values())
        if total_bytes > 0:
            language_percentages = {
                lang: round((bytes_count / total_bytes) * 100, 2)
                for lang, bytes_count in language_stats.items()
            }
        else:
            language_percentages = {}
        
        return {
            "raw_bytes": language_stats,
            "percentages": language_percentages,
            "total_repos_analyzed": len([r for r in repos if not r['fork']])
        }
    
    def get_repository_details(self, repo_name: str) -> Dict:
        """Get detailed repository information"""
        repo = self._make_request(f"/repos/{self.username}/{repo_name}")
        
        # Get additional data
        languages = self.get_repository_languages(repo_name)
        commits = self.get_commit_history(repo_name)
        
        return {
            "basic_info": repo,
            "languages": languages,
            "recent_commits": commits[:5],  # Last 5 commits
            "total_commits": len(commits),
            "primary_language": repo.get('language', 'Unknown')
        }

# Singleton instance
github_service = GitHubService()