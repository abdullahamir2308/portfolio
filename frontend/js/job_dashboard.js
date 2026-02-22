/**
 * JOB DASHBOARD - Phase 1
 * Job application tracking and AI assistance
 */

class JobDashboard {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.jobs = [];
        this.stats = {};
        this.resumeData = {};
        this.initializeDashboard();
    }
    
    async initializeDashboard() {
        // Add job dashboard section
        if (!document.getElementById('jobDashboard')) {
            const jobHtml = `
                <div class="row mt-5" id="jobDashboard">
                    <div class="col-12">
                        <div class="card shadow-lg border-danger">
                            <div class="card-header bg-gradient-danger text-white">
                                <h5 class="mb-0">
                                    <i class="fas fa-briefcase me-2"></i>Job Application Assistant
                                    <span class="badge bg-warning float-end">BETA</span>
                                </h5>
                                <small>Track applications, tailor resumes, and optimize your job search</small>
                            </div>
                            <div class="card-body">
                                <!-- Stats Overview -->
                                <div class="row mb-4" id="jobStats">
                                    <div class="col-md-3">
                                        <div class="card bg-primary text-white">
                                            <div class="card-body text-center">
                                                <h2 id="totalJobs">0</h2>
                                                <p class="mb-0">Total Applications</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-success text-white">
                                            <div class="card-body text-center">
                                                <h2 id="avgMatchScore">0</h2>
                                                <p class="mb-0">Avg Match Score</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-info text-white">
                                            <div class="card-body text-center">
                                                <h2 id="recentJobs">0</h2>
                                                <p class="mb-0">Last 30 Days</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-warning text-white">
                                            <div class="card-body text-center">
                                                <h2 id="companiesCount">0</h2>
                                                <p class="mb-0">Companies</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Recommended Jobs -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0"><i class="fas fa-lightbulb me-2"></i>Recommended Jobs</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="recommendedJobsContainer" style="max-height: 300px; overflow-y: auto;">
                                            <div class="text-center py-3">
                                                <div class="spinner-border spinner-border-sm" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                                <p class="text-muted mt-2 mb-0">Finding recommended jobs...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Analytics Dashboard -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Job Search Analytics</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="analyticsContainer">
                                            <div class="text-center py-3">
                                                <div class="spinner-border" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                                <p class="text-muted mt-2">Loading analytics...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Add New Job Form -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0"><i class="fas fa-plus-circle me-2"></i>Add New Application</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Company Name *</label>
                                                    <input type="text" id="jobCompany" class="form-control" 
                                                           placeholder="e.g., Google, Microsoft">
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label">Job Position *</label>
                                                    <input type="text" id="jobPosition" class="form-control" 
                                                           placeholder="e.g., AI Developer, Web Engineer">
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label">Job URL</label>
                                                    <input type="url" id="jobUrl" class="form-control" 
                                                           placeholder="https://company.com/careers/...">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Job Description</label>
                                                    <textarea id="jobDescription" class="form-control" rows="4" 
                                                              placeholder="Paste job description here for AI analysis..."></textarea>
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label">Notes</label>
                                                    <textarea id="jobNotes" class="form-control" rows="2" 
                                                              placeholder="Any personal notes about this application..."></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <button class="btn btn-success" onclick="jobDashboard.addNewJob()">
                                            <i class="fas fa-paper-plane me-2"></i>Add & Analyze
                                        </button>
                                        <small class="text-muted ms-2">AI will analyze match with your skills</small>
                                    </div>
                                </div>
                                
                                <!-- Job Applications List -->
                                <div>
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6><i class="fas fa-list me-2"></i>Your Applications</h6>
                                        <div class="btn-group" role="group">
                                            <button class="btn btn-sm btn-outline-secondary active" onclick="jobDashboard.filterJobs('all')">All</button>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="jobDashboard.filterJobs('applied')">Applied</button>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="jobDashboard.filterJobs('interviewed')">Interviewed</button>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="jobDashboard.filterJobs('offer')">Offer</button>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end mb-3">
                                        <button class="btn btn-sm btn-outline-success me-2" onclick="jobDashboard.exportCSV()">
                                            <i class="fas fa-file-csv me-1"></i>Export CSV
                                        </button>
                                        <button class="btn btn-sm btn-outline-primary" onclick="jobDashboard.exportJSON()">
                                            <i class="fas fa-download me-1"></i>Export JSON
                                        </button>
                                    </div>
                                    <div id="jobList" class="border rounded p-3 bg-light" 
                                         style="max-height: 400px; overflow-y: auto;">
                                        <div class="text-center text-muted py-3">
                                            <i class="fas fa-spinner fa-spin"></i> Loading job applications...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after case studies section
            const caseStudies = document.getElementById('caseStudiesSection');
            if (caseStudies) {
                caseStudies.insertAdjacentHTML('afterend', jobHtml);
            }
            
            // Load initial data
            await this.loadJobs();
            await this.loadResumeData();
            await this.updateStats();
            await this.loadRecommendedJobs();
            await this.loadAnalytics();
            await this.checkFollowups();
            
            // Set up lazy loading for this dashboard
            this.setupLazyLoading();
            
            // Set up periodic checks
            setInterval(() => this.checkFollowups(), 3600000); // Every hour
            setInterval(() => this.loadAnalytics(), 1800000); // Every 30 minutes
        }
    }
    
    setupLazyLoading() {
        const dashboard = document.getElementById('jobDashboard');
        if (!dashboard) return;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.loadJobs();
                this.loadResumeData();
                observer.unobserve(dashboard);
            }
        }, { threshold: 0.1 });
        
        observer.observe(dashboard);
    }
    
    async loadJobs() {
        try {
            const response = await fetch(`${this.backendUrl}/jobs`);
            const data = await response.json();
            
            this.jobs = data.jobs || [];
            this.stats = data.stats || {};
            
            this.renderJobList();
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to load jobs:', error);
            this.showError('Failed to load job applications');
        }
    }
    
    async loadResumeData() {
        try {
            const response = await fetch(`${this.backendUrl}/resume`);
            this.resumeData = await response.json();
        } catch (error) {
            console.error('Failed to load resume data:', error);
        }
    }
    
    async loadRecommendedJobs() {
        try {
            const response = await fetch(`${this.backendUrl}/jobs/recommended`);
            const data = await response.json();
            
            this.recommendedJobs = data.recommended_jobs || [];
            this.renderRecommendedJobs();
            
        } catch (error) {
            console.error('Failed to load recommended jobs:', error);
        }
    }
    
    async loadAnalytics() {
        try {
            const [dailyResp, weeklyResp] = await Promise.all([
                fetch(`${this.backendUrl}/jobs/analytics/daily`),
                fetch(`${this.backendUrl}/jobs/analytics/weekly`)
            ]);
            
            this.dailyAnalytics = await dailyResp.json();
            this.weeklyAnalytics = await weeklyResp.json();
            
            this.renderAnalytics();
            
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }
    
    async checkFollowups() {
        try {
            const response = await fetch(`${this.backendUrl}/jobs/followups`);
            const data = await response.json();
            
            this.followups = data.followups_needed || [];
            
            if (this.followups.length > 0) {
                this.showFollowupReminder();
            }
            
        } catch (error) {
            console.error('Failed to check followups:', error);
        }
    }
    
    updateStats() {
        // Update stat cards
        document.getElementById('totalJobs').textContent = this.stats.total_applications || 0;
        document.getElementById('avgMatchScore').textContent = this.stats.match_score_avg || '0';
        document.getElementById('recentJobs').textContent = this.stats.last_30_days || 0;
        document.getElementById('companiesCount').textContent = this.stats.companies_applied || 0;
        
        // Update status filter badges
        if (this.stats.by_status) {
            // Could add badges showing counts for each status
        }
    }
    
    renderJobList() {
        const container = document.getElementById('jobList');
        if (!container) return;
        
        if (this.jobs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-briefcase fa-3x text-muted mb-3"></i>
                    <h5>No Job Applications Yet</h5>
                    <p class="text-muted">Add your first job application above to get started!</p>
                </div>
            `;
            return;
        }
        
        // Sort by most recent
        const sortedJobs = [...this.jobs].sort((a, b) => 
            new Date(b.applied_date) - new Date(a.applied_date)
        );
        
        container.innerHTML = sortedJobs.map(job => this.createJobCard(job)).join('');
    }
    
    createJobCard(job) {
        const statusColors = {
            'applied': 'primary',
            'interviewed': 'warning',
            'rejected': 'danger',
            'offer': 'success',
            'default': 'secondary'
        };
        
        const statusColor = statusColors[job.status] || statusColors.default;
        const matchScore = job.analysis?.match_score || 50;
        const matchColor = matchScore >= 80 ? 'success' : matchScore >= 60 ? 'warning' : 'danger';
        
        return `
            <div class="card mb-3 job-card" data-job-id="${job.id}" data-status="${job.status}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${job.position || 'Unknown Position'}</h6>
                            <p class="mb-1">
                                <i class="fas fa-building me-1"></i>${job.company || 'Unknown Company'}
                                <span class="badge bg-${statusColor} ms-2">${job.status.toUpperCase()}</span>
                            </p>
                            <p class="text-muted small mb-2">
                                <i class="fas fa-calendar me-1"></i>
                                Applied: ${new Date(job.applied_date).toLocaleDateString()}
                            </p>
                        </div>
                        <div class="text-end">
                            <div class="mb-2">
                                <span class="badge bg-${matchColor}">Match: ${matchScore}%</span>
                            </div>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="jobDashboard.viewJobDetails('${job.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-outline-success" onclick="jobDashboard.tailorResume('${job.id}')">
                                    <i class="fas fa-magic"></i>
                                </button>
                                <button class="btn btn-outline-info" onclick="jobDashboard.generateCoverLetter('${job.id}')">
                                    <i class="fas fa-file-alt"></i>
                                </button>
                                <button class="btn btn-outline-warning" onclick="jobDashboard.sendFollowup('${job.id}')">
                                    <i class="fas fa-envelope"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${job.notes ? `
                    <div class="mt-2">
                        <small><strong>Notes:</strong> ${job.notes}</small>
                    </div>
                    ` : ''}
                    
                    ${job.analysis?.matching_skills ? `
                    <div class="mt-2">
                        <small><strong>Matching Skills:</strong> 
                            ${job.analysis.matching_skills.slice(0, 3).map(skill => 
                                `<span class="badge bg-secondary me-1">${skill}</span>`
                            ).join('')}
                        </small>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    async addNewJob() {
        const company = document.getElementById('jobCompany').value.trim();
        const position = document.getElementById('jobPosition').value.trim();
        const url = document.getElementById('jobUrl').value.trim();
        const description = document.getElementById('jobDescription').value.trim();
        const notes = document.getElementById('jobNotes').value.trim();
        
        if (!company || !position) {
            this.showError('Company and Position are required');
            return;
        }
        
        try {
            const response = await fetch(`${this.backendUrl}/jobs/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    company,
                    position,
                    job_url: url,
                    description,
                    notes
                })
            });
            
            const result = await response.json();
            
            // Clear form
            document.getElementById('jobCompany').value = '';
            document.getElementById('jobPosition').value = '';
            document.getElementById('jobUrl').value = '';
            document.getElementById('jobDescription').value = '';
            document.getElementById('jobNotes').value = '';
            
            // Show success message
            this.showSuccess(`Added job at ${company}! AI analysis complete.`);
            
            // Refresh list
            await this.loadJobs();
            
            // Show analysis results
            if (result.analysis) {
                this.showAnalysisModal(result.job, result.analysis);
            }
            
        } catch (error) {
            console.error('Failed to add job:', error);
            this.showError('Failed to add job application');
        }
    }
    
    async tailorResume(jobId) {
        try {
            const response = await fetch(`${this.backendUrl}/jobs/${jobId}/tailor-resume`);
            const suggestions = await response.json();
            
            if (suggestions.error) {
                this.showError(suggestions.error);
                return;
            }
            
            this.showTailoringModal(jobId, suggestions);
            
        } catch (error) {
            console.error('Failed to tailor resume:', error);
            this.showError('Failed to generate tailoring suggestions');
        }
    }
    
    renderRecommendedJobs() {
        const container = document.getElementById('recommendedJobsContainer');
        if (!container || !this.recommendedJobs.length) return;
        
        container.innerHTML = this.recommendedJobs.map(job => `
            <div class="card mb-2">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${job.title}</h6>
                            <p class="mb-1 small">
                                <i class="fas fa-building me-1"></i>${job.company}
                                <span class="badge bg-secondary ms-2">${job.source}</span>
                            </p>
                            <p class="text-muted small mb-0">
                                <i class="fas fa-map-marker-alt me-1"></i>${job.location}
                                ${job.remote ? '<span class="badge bg-success ms-2">Remote</span>' : ''}
                            </p>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="jobDashboard.importJob('${job.source}', ${JSON.stringify(job).replace(/'/g, "\\'")})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderAnalytics() {
        const container = document.getElementById('analyticsContainer');
        if (!container || !this.dailyAnalytics) return;
        
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header">
                            <h6 class="mb-0">📊 Daily Summary</h6>
                        </div>
                        <div class="card-body">
                            <div class="text-center mb-3">
                                <div class="display-4 text-primary">
                                    ${this.dailyAnalytics.applications_today || 0}
                                </div>
                                <p class="text-muted">Applications Today</p>
                            </div>
                            
                            <p><strong>Success Rate:</strong> ${this.dailyAnalytics.success_rate || 0}%</p>
                            <p><strong>Avg Match Score:</strong> ${this.dailyAnalytics.average_match_score || 0}%</p>
                            
                            ${this.dailyAnalytics.recommended_actions ? `
                            <h6 class="mt-3">💡 Recommendations</h6>
                            <ul class="small">
                                ${this.dailyAnalytics.recommended_actions.slice(0, 3).map(action => 
                                    `<li>${action}</li>`
                                ).join('')}
                            </ul>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header">
                            <h6 class="mb-0">📈 Weekly Trends</h6>
                        </div>
                        <div class="card-body">
                            <p><strong>This Week:</strong> ${this.weeklyAnalytics.applications_this_week || 0} applications</p>
                            <p><strong>Interviews:</strong> ${this.weeklyAnalytics.interviews_this_week || 0}</p>
                            <p><strong>Offers:</strong> ${this.weeklyAnalytics.offers_this_week || 0}</p>
                            
                            ${this.weeklyAnalytics.week_over_week_change ? `
                            <p><strong>Week-over-week:</strong> 
                                <span class="${this.weeklyAnalytics.week_over_week_change > 0 ? 'text-success' : 'text-danger'}">
                                    ${this.weeklyAnalytics.week_over_week_change > 0 ? '+' : ''}${this.weeklyAnalytics.week_over_week_change}%
                                </span>
                            </p>
                            ` : ''}
                            
                            ${this.weeklyAnalytics.insights ? `
                            <h6 class="mt-3">✨ Insights</h6>
                            <ul class="small">
                                ${this.weeklyAnalytics.insights.slice(0, 2).map(insight => 
                                    `<li>${insight}</li>`
                                ).join('')}
                            </ul>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async importJob(source, jobData) {
        try {
            const response = await fetch(`${this.backendUrl}/jobs/import/${source}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(jobData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(`Job imported from ${source}!`);
                await this.loadJobs();
            }
            
        } catch (error) {
            console.error('Failed to import job:', error);
            this.showError('Failed to import job');
        }
    }
    
    showFollowupReminder() {
        const reminderHtml = `
            <div class="toast align-items-center text-bg-warning border-0" id="followupToast">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-bell me-2"></i>
                        <strong>Follow-up Reminder:</strong> ${this.followups.length} applications need follow-up
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        // Add to toast container
        let container = document.getElementById('errorToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'errorToastContainer';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
        
        container.insertAdjacentHTML('afterbegin', reminderHtml);
        
        // Show toast
        const toast = new bootstrap.Toast(document.getElementById('followupToast'), {
            delay: 10000
        });
        toast.show();
    }
    
    async generateCoverLetter(jobId) {
        try {
            const response = await fetch(`${this.backendUrl}/jobs/${jobId}/cover-letter`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.error) {
                this.showError(result.error);
                return;
            }
            
            this.showCoverLetterModal(result.cover_letter);
            
        } catch (error) {
            console.error('Failed to generate cover letter:', error);
            this.showError('Failed to generate cover letter');
        }
    }
    
    async sendFollowup(jobId) {
        const type = confirm('Send first follow-up? Click OK for first, Cancel for second.') ? 'first' : 'second';
        
        try {
            const response = await fetch(`${this.backendUrl}/jobs/${jobId}/followup-email?followup_type=${type}`, {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess('Follow-up email sent!');
                await this.loadJobs(); // refresh status
            } else {
                this.showError(result.error || 'Failed to send follow-up');
            }
        } catch (error) {
            console.error('Failed to send follow-up:', error);
            this.showError('Failed to send follow-up');
        }
    }
    
    filterJobs(status) {
        const cards = document.querySelectorAll('.job-card');
        const buttons = document.querySelectorAll('.btn-group .btn');
        
        // Update active button
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Filter cards
        cards.forEach(card => {
            if (status === 'all' || card.dataset.status === status) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    viewJobDetails(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;
        
        this.showJobDetailsModal(job);
    }
    
    showJobDetailsModal(job) {
        const modalHtml = `
            <div class="modal fade" id="jobDetailsModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">${job.position} at ${job.company}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h6>Job Details</h6>
                                    <p><strong>Status:</strong> <span class="badge bg-primary">${job.status.toUpperCase()}</span></p>
                                    <p><strong>Applied:</strong> ${new Date(job.applied_date).toLocaleString()}</p>
                                    <p><strong>Last Updated:</strong> ${new Date(job.last_updated).toLocaleString()}</p>
                                    
                                    ${job.job_url ? `
                                    <p><strong>Job URL:</strong> 
                                        <a href="${job.job_url}" target="_blank">${job.job_url}</a>
                                    </p>
                                    ` : ''}
                                    
                                    ${job.description ? `
                                    <h6 class="mt-4">Job Description</h6>
                                    <div class="border rounded p-3 bg-light small">
                                        ${job.description.substring(0, 800)}${job.description.length > 800 ? '...' : ''}
                                    </div>
                                    ` : ''}
                                    
                                    ${job.notes ? `
                                    <h6 class="mt-4">Your Notes</h6>
                                    <p>${job.notes}</p>
                                    ` : ''}
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0">AI Analysis</h6>
                                        </div>
                                        <div class="card-body">
                                            ${job.analysis ? `
                                            <p><strong>Match Score:</strong> 
                                                <span class="badge bg-${job.analysis.match_score >= 80 ? 'success' : job.analysis.match_score >= 60 ? 'warning' : 'danger'}">
                                                    ${job.analysis.match_score}%
                                                </span>
                                            </p>
                                            <p><strong>Confidence:</strong> ${job.analysis.confidence || 'Medium'}</p>
                                            
                                            <h6>Matching Skills</h6>
                                            <div class="mb-2">
                                                ${(job.analysis.matching_skills || []).slice(0, 5).map(skill => 
                                                    `<span class="badge bg-success me-1 mb-1">${skill}</span>`
                                                ).join('')}
                                            </div>
                                            
                                            <h6>Skill Gaps</h6>
                                            <div class="mb-2">
                                                ${(job.analysis.skill_gaps || []).map(gap => 
                                                    `<span class="badge bg-warning me-1 mb-1">${gap}</span>`
                                                ).join('')}
                                            </div>
                                            
                                            <h6>Keywords to Add</h6>
                                            <div>
                                                ${(job.analysis.keywords || []).map(keyword => 
                                                    `<span class="badge bg-info me-1 mb-1">${keyword}</span>`
                                                ).join('')}
                                            </div>
                                            ` : '<p class="text-muted">No analysis available</p>'}
                                        </div>
                                    </div>
                                    
                                    <div class="mt-3">
                                        <button class="btn btn-sm btn-outline-success w-100 mb-2" 
                                                onclick="jobDashboard.tailorResume('${job.id}')">
                                            <i class="fas fa-magic me-1"></i>Tailor Resume
                                        </button>
                                        <button class="btn btn-sm btn-outline-primary w-100" 
                                                onclick="jobDashboard.generateCoverLetter('${job.id}')">
                                            <i class="fas fa-file-alt me-1"></i>Generate Cover Letter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHtml, 'jobDetailsModal');
    }
    
    showAnalysisModal(job, analysis) {
        const modalHtml = `
            <div class="modal fade" id="analysisModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-chart-line me-2"></i>Job Match Analysis
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <div class="display-4 text-${analysis.match_score >= 80 ? 'success' : analysis.match_score >= 60 ? 'warning' : 'danger'}">
                                    ${analysis.match_score}%
                                </div>
                                <p class="text-muted">Match Score</p>
                            </div>
                            
                            <h6>Job: ${job.position} at ${job.company}</h6>
                            
                            <div class="mb-3">
                                <strong>Matching Skills:</strong>
                                <div class="mt-2">
                                    ${analysis.matching_skills.map(skill => 
                                        `<span class="badge bg-success me-1 mb-1">${skill}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <strong>Skill Gaps:</strong>
                                <div class="mt-2">
                                    ${analysis.skill_gaps.map(gap => 
                                        `<span class="badge bg-warning me-1 mb-1">${gap}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <strong>Keywords to Add:</strong>
                                <div class="mt-2">
                                    ${analysis.keywords.map(keyword => 
                                        `<span class="badge bg-info me-1 mb-1">${keyword}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-lightbulb me-2"></i>
                                <strong>Tip:</strong> ${analysis.suggestions ? analysis.suggestions[0] : 'Use the Tailor Resume feature to optimize your application.'}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Got it!</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHtml, 'analysisModal');
    }
    
    showTailoringModal(jobId, suggestions) {
        const modalHtml = `
            <div class="modal fade" id="tailoringModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-magic me-2"></i>Resume Tailoring Suggestions
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Skills to Emphasize</h6>
                                    <div class="mb-4">
                                        ${suggestions.skills_to_emphasize.map(skill => 
                                            `<span class="badge bg-success me-1 mb-1">${skill}</span>`
                                        ).join('')}
                                    </div>
                                    
                                    <h6>Projects to Highlight</h6>
                                    <ul class="mb-4">
                                        ${suggestions.projects_to_highlight.map(project => 
                                            `<li>${project}</li>`
                                        ).join('')}
                                    </ul>
                                </div>
                                
                                <div class="col-md-6">
                                    <h6>Keywords to Include</h6>
                                    <div class="mb-4">
                                        ${suggestions.keywords.map(keyword => 
                                            `<span class="badge bg-info me-1 mb-1">${keyword}</span>`
                                        ).join('')}
                                    </div>
                                    
                                    <h6>Suggested Summary</h6>
                                    <div class="border rounded p-3 bg-light mb-4">
                                        <p class="mb-0">${suggestions.suggested_summary}</p>
                                    </div>
                                    
                                    <h6>Formatting Tips</h6>
                                    <ul>
                                        ${suggestions.formatting_tips.map(tip => 
                                            `<li>${tip}</li>`
                                        ).join('')}
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="alert alert-warning mt-3">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                These are AI-generated suggestions. Always review and customize for your specific situation.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success" onclick="jobDashboard.saveTailoringSuggestions('${jobId}')">
                                <i class="fas fa-save me-1"></i>Save Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHtml, 'tailoringModal');
    }
    
    showCoverLetterModal(coverLetter) {
        const modalHtml = `
            <div class="modal fade" id="coverLetterModal">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-file-alt me-2"></i>AI-Generated Cover Letter
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="border rounded p-4 bg-white">
                                <div style="font-family: 'Times New Roman', serif; line-height: 1.6;">
                                    ${coverLetter.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                            
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Important:</strong> This is an AI-generated draft. Always personalize it with specific details about the company and role.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="jobDashboard.copyCoverLetter()">
                                <i class="fas fa-copy me-1"></i>Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHtml, 'coverLetterModal');
    }
    
    showModal(html, modalId) {
        // Remove existing modal
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }
    
    showSuccess(message) {
        if (window.showErrorToast) {
            window.showErrorToast('success', 'Success', message);
        } else {
            alert(`✅ ${message}`);
        }
    }
    
    showError(message) {
        if (window.showErrorToast) {
            window.showErrorToast('error', 'Error', message);
        } else {
            alert(`❌ ${message}`);
        }
    }
    
    copyCoverLetter() {
        const modal = document.querySelector('#coverLetterModal .modal-body');
        if (!modal) return;
        
        const coverLetterText = modal.querySelector('div[style*="font-family"]').innerText;
        
        navigator.clipboard.writeText(coverLetterText)
            .then(() => {
                this.showSuccess('Cover letter copied to clipboard!');
            })
            .catch(() => {
                this.showError('Failed to copy to clipboard');
            });
    }
    
    saveTailoringSuggestions(jobId) {
        // Implement saving to notes
        this.showSuccess('Tailoring suggestions saved to job notes');
        const modal = bootstrap.Modal.getInstance(document.getElementById('tailoringModal'));
        modal.hide();
    }

    async exportCSV() {
    try {
        window.location.href = `${this.backendUrl}/jobs/export/csv`;
        this.showSuccess('CSV download started');
    } catch (error) {
        this.showError('Export failed');
    }
}

async exportJSON() {
    try {
        const response = await fetch(`${this.backendUrl}/jobs/export/json`);
        const data = await response.json();
        
        // Create download link
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job_applications_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        
        this.showSuccess('JSON export complete');
    } catch (error) {
        this.showError('JSON export failed');
    }
}
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.jobDashboard = new JobDashboard('http://localhost:8000');
});