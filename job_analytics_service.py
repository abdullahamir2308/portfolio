"""
JOB ANALYTICS SERVICE 
Enhanced analytics and email notifications for job applications
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import Counter
import logging
from dotenv import load_dotenv

load_dotenv()

class JobAnalyticsService:
    """Service for job application analytics and notifications"""
    
    def __init__(self, job_service):
        self.job_service = job_service
        self.analytics_file = "job_analytics.json"
        self.load_analytics()
    
    def load_analytics(self):
        """Load analytics data"""
        if os.path.exists(self.analytics_file):
            with open(self.analytics_file, 'r') as f:
                self.analytics_data = json.load(f)
        else:
            self.analytics_data = {
                "daily_stats": {},
                "weekly_reports": [],
                "success_patterns": [],
                "skill_trends": {}
            }
    
    def save_analytics(self):
        """Save analytics data"""
        with open(self.analytics_file, 'w') as f:
            json.dump(self.analytics_data, f, indent=2)
    
    def generate_daily_report(self) -> Dict:
        """Generate daily job search report"""
        
        today = datetime.now().strftime("%Y-%m-%d")
        jobs = self.job_service.jobs
        
        # Filter today's applications
        today_apps = [
            job for job in jobs 
            if job.get("applied_date", "").startswith(today)
        ]
        
        # Calculate stats
        total_apps = len(jobs)
        avg_match_score = self.job_service.get_job_stats().get("match_score_avg", 0)
        
        # Status breakdown
        status_counts = {}
        for job in jobs:
            status = job.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Success rate (interviewed + offers / total)
        success_count = status_counts.get("interviewed", 0) + status_counts.get("offer", 0)
        success_rate = (success_count / total_apps * 100) if total_apps > 0 else 0
        
        # Common skill gaps
        skill_gaps = []
        for job in jobs[-10:]:  # Last 10 jobs
            if job.get("analysis") and job["analysis"].get("skill_gaps"):
                skill_gaps.extend(job["analysis"]["skill_gaps"])
        common_gaps = Counter(skill_gaps).most_common(3)
        
        report = {
            "date": today,
            "total_applications": total_apps,
            "applications_today": len(today_apps),
            "average_match_score": round(avg_match_score, 1),
            "success_rate": round(success_rate, 1),
            "status_breakdown": status_counts,
            "common_skill_gaps": dict(common_gaps),
            "companies_applied": len(set(j.get("company", "") for j in jobs)),
            "recommended_actions": self._generate_recommendations(jobs, common_gaps)
        }
        
        # Save to daily stats
        if today not in self.analytics_data["daily_stats"]:
            self.analytics_data["daily_stats"][today] = report
            self.save_analytics()
        
        return report
    
    def _generate_recommendations(self, jobs: List[Dict], common_gaps: List) -> List[str]:
        """Generate personalized recommendations"""
        
        recommendations = []
        
        # Check application frequency
        last_week_apps = []
        for job in jobs:
            try:
                applied_date_str = job.get("applied_date", "")
                if applied_date_str:
                    applied_date = datetime.fromisoformat(applied_date_str)
                    if applied_date.timestamp() > (datetime.now() - timedelta(days=7)).timestamp():
                        last_week_apps.append(job)
            except (ValueError, TypeError):
                continue
        
        if len(last_week_apps) < 3:
            recommendations.append("📈 Increase application frequency: Aim for 3-5 applications per week")
        
        # Check match scores
        low_match_jobs = [
            job for job in jobs[-10:]
            if job.get("analysis", {}).get("match_score", 100) < 60
        ]
        
        if len(low_match_jobs) > 5:
            recommendations.append("🎯 Focus on better-matched roles: Your recent applications have low match scores")
        
        # Skill gap recommendations
        if common_gaps:
            gap_str = ", ".join([gap for gap, _ in common_gaps[:2]])
            recommendations.append(f"📚 Develop skills: Consider learning {gap_str}")
        
        # Follow-up recommendations
        need_follow_up = []
        for job in jobs:
            try:
                if job.get("status") not in ["rejected", "offer"]:
                    applied_date_str = job.get("applied_date", "")
                    if applied_date_str:
                        applied_date = datetime.fromisoformat(applied_date_str)
                        if applied_date.timestamp() < (datetime.now() - timedelta(days=7)).timestamp():
                            need_follow_up.append(job)
            except (ValueError, TypeError):
                continue
        
        if need_follow_up:
            recommendations.append(f"📧 Send follow-ups: {len(need_follow_up)} applications need follow-up")
        
        # Add generic encouragement
        if len(recommendations) < 2:
            recommendations.append("💪 Keep going! Consistency is key in job searching")
            recommendations.append("✨ Tailor each application: Quality over quantity")
        
        return recommendations
    
    def get_weekly_summary(self) -> Dict:
        """Generate weekly summary report"""
        
        one_week_ago = datetime.now() - timedelta(days=7)
        week_jobs = []
        
        for job in self.job_service.jobs:
            try:
                applied_date_str = job.get("applied_date", "")
                if applied_date_str:
                    applied_date = datetime.fromisoformat(applied_date_str)
                    if applied_date.timestamp() > one_week_ago.timestamp():
                        week_jobs.append(job)
            except (ValueError, TypeError):
                continue
        
        # Calculate weekly stats
        stats = {
            "week_start": one_week_ago.strftime("%Y-%m-%d"),
            "week_end": datetime.now().strftime("%Y-%m-%d"),
            "applications_this_week": len(week_jobs),
            "interviews_this_week": len([j for j in week_jobs if j.get("status") == "interviewed"]),
            "offers_this_week": len([j for j in week_jobs if j.get("status") == "offer"]),
            "average_daily_applications": round(len(week_jobs) / 7, 1),
            "best_match_score": max([j.get("analysis", {}).get("match_score", 0) for j in week_jobs], default=0),
            "companies_contacted": len(set(j.get("company", "") for j in week_jobs))
        }
        
        # Calculate week-over-week change
        two_weeks_ago = datetime.now() - timedelta(days=14)
        prev_week_jobs = []
        
        for job in self.job_service.jobs:
            try:
                applied_date_str = job.get("applied_date", "")
                if applied_date_str:
                    applied_date = datetime.fromisoformat(applied_date_str)
                    if two_weeks_ago.timestamp() < applied_date.timestamp() <= one_week_ago.timestamp():
                        prev_week_jobs.append(job)
            except (ValueError, TypeError):
                continue
        
        if prev_week_jobs:
            prev_week_count = len(prev_week_jobs)
            week_over_week = ((len(week_jobs) - prev_week_count) / prev_week_count * 100)
            stats["week_over_week_change"] = round(week_over_week, 1)
        else:
            stats["week_over_week_change"] = 0
        
        # Generate weekly insights
        insights = self._generate_weekly_insights(week_jobs)
        stats["insights"] = insights
        
        # Save weekly report
        self.analytics_data["weekly_reports"].append({
            **stats,
            "generated_at": datetime.now().isoformat()
        })
        
        # Keep only last 8 weeks
        if len(self.analytics_data["weekly_reports"]) > 8:
            self.analytics_data["weekly_reports"] = self.analytics_data["weekly_reports"][-8:]
        
        self.save_analytics()
        
        return stats
    
    def _generate_weekly_insights(self, week_jobs: List[Dict]) -> List[str]:
        """Generate insights from weekly data"""
        
        if not week_jobs:
            return ["📊 No applications this week. Start applying to see insights!"]
        
        insights = []
        
        # Application timing insight
        application_days = {}
        for job in week_jobs:
            day = datetime.fromisoformat(job.get("applied_date", "")).strftime("%A")
            application_days[day] = application_days.get(day, 0) + 1
        
        if application_days:
            busiest_day = max(application_days, key=application_days.get)
            insights.append(f"📅 You applied most on {busiest_day}s")
        
        # Match score trend
        match_scores = [j.get("analysis", {}).get("match_score", 50) for j in week_jobs]
        avg_match = sum(match_scores) / len(match_scores)
        
        if avg_match > 75:
            insights.append("🎯 Excellent job targeting! Your applications are well-matched")
        elif avg_match > 60:
            insights.append("👍 Good match scores. Consider being slightly more selective")
        else:
            insights.append("🎯 Focus on better-matched roles to improve response rates")
        
        # Status progression insight
        interview_rate = len([j for j in week_jobs if j.get("status") == "interviewed"]) / len(week_jobs) * 100
        
        if interview_rate > 20:
            insights.append("🚀 Great interview conversion rate!")
        elif interview_rate > 10:
            insights.append("📈 Good progress. Your applications are getting noticed")
        else:
            insights.append("💡 Consider improving resume tailoring for better response rates")
        
        return insights
    
    def check_followups_needed(self) -> List[Dict]:
        """Check which applications need follow-up"""
        
        followups = []
        
        for job in self.job_service.jobs:
            try:
                if job.get("status") not in ["rejected", "offer"]:
                    applied_date_str = job.get("applied_date", "")
                    if applied_date_str:
                        applied_date = datetime.fromisoformat(applied_date_str)
                        days_since = (datetime.now() - applied_date).days
                        
                        # Check follow-up schedule
                        if days_since == 7:  # First follow-up
                            followups.append({
                                "job": job,
                                "type": "first_followup",
                                "days_since": days_since,
                                "suggested_message": f"Follow-up on {job.get('position')} at {job.get('company')}"
                            })
                        elif days_since == 14:  # Second follow-up
                            followups.append({
                                "job": job,
                                "type": "second_followup",
                                "days_since": days_since,
                                "suggested_message": f"Second follow-up on {job.get('position')}"
                            })
            except (ValueError, TypeError) as e:
                logging.error(f"Error checking followups for job {job.get('id')}: {e}")
                continue
        
        return followups

# Note: This should be initialized in main.py with the job_service instance
# Example: job_analytics_service = JobAnalyticsService(job_service)