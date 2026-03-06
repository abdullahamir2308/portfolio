"""
EXPORT SERVICE - Day 14
Export job applications to CSV/PDF
"""

import csv
import json
import os
from datetime import datetime
from typing import List, Dict
from fastapi.responses import StreamingResponse, FileResponse
import io

from backend import job_service

class ExportService:
    def __init__(self, job_service):
        self.job_service = job_service
    
    def export_to_csv(self) -> StreamingResponse:
        """Generate CSV of all job applications"""
        
        jobs = self.job_service.jobs
        
        # Define CSV columns
        columns = [
            'Company', 'Position', 'Status', 'Applied Date', 
            'Match Score', 'URL', 'Notes'
        ]
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(columns)
        
        for job in jobs:
            writer.writerow([
                job.get('company', ''),
                job.get('position', ''),
                job.get('status', ''),
                job.get('applied_date', '')[:10],
                job.get('analysis', {}).get('match_score', ''),
                job.get('job_url', ''),
                job.get('notes', '')
            ])
        
        output.seek(0)
        
        filename = f"job_applications_{datetime.now().strftime('%Y%m%d')}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    def export_to_json(self) -> Dict:
        """Export applications as JSON for backup"""
        return {
            "exported_at": datetime.now().isoformat(),
            "total_applications": len(self.job_service.jobs),
            "applications": self.job_service.jobs
        }

export_service = ExportService(job_service)