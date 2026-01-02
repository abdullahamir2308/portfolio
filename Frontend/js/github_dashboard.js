/**
 * GITHUB DASHBOARD - Day 8
 * Display GitHub activity and statistics
 */

class GitHubDashboard {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.userData = null;
        this.repos = [];
        this.activity = [];
        this.initializeDashboard();
    }
    
    initializeDashboard() {
        // Add GitHub dashboard section
        if (!document.getElementById('githubDashboard')) {
            const githubHtml = `
                <div class="row mt-5" id="githubDashboard">
                    <div class="col-12">
                        <div class="card shadow-lg border-dark">
                            <div class="card-header bg-gradient-dark text-white">
                                <h5 class="mb-0">
                                    <i class="fab fa-github me-2"></i>GitHub Integration
                                    <span class="badge bg-success float-end">Live</span>
                                </h5>
                                <small>Your real GitHub activity and statistics</small>
                            </div>
                            <div class="card-body">
                                <!-- Connection Status -->
                                <div class="row mb-4">
                                    <div class="col-md-12">
                                        <div class="alert alert-info" id="githubStatus">
                                            <i class="fas fa-sync fa-spin me-2"></i>Connecting to GitHub...
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- GitHub Stats -->
                                <div class="row mb-4" id="githubStats" style="display: none;">
                                    <div class="col-md-3">
                                        <div class="card bg-dark text-white">
                                            <div class="card-body text-center">
                                                <h2 id="totalRepos">0</h2>
                                                <p class="mb-0">Repositories</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-primary text-white">
                                            <div class="card-body text-center">
                                                <h2 id="totalCommits">0</h2>
                                                <p class="mb-0">Commits</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-success text-white">
                                            <div class="card-body text-center">
                                                <h2 id="totalPRs">0</h2>
                                                <p class="mb-0">Pull Requests</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-warning text-white">
                                            <div class="card-body text-center">
                                                <h2 id="activeRepos">0</h2>
                                                <p class="mb-0">Active Repos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Language Chart -->
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header">
                                                <h6 class="mb-0"><i class="fas fa-code me-2"></i>Top Languages</h6>
                                            </div>
                                            <div class="card-body">
                                                <div id="languageChart" style="height: 300px;">
                                                    <div class="text-center text-muted py-5">
                                                        <i class="fas fa-spinner fa-spin"></i> Loading language data...
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header">
                                                <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Recent Activity</h6>
                                            </div>
                                            <div class="card-body">
                                                <div id="activityTimeline" style="height: 300px; overflow-y: auto;">
                                                    <div class="text-center text-muted py-5">
                                                        <i class="fas fa-spinner fa-spin"></i> Loading activity...
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Repositories List -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0"><i class="fas fa-book me-2"></i>Recent Repositories</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="repositoriesList" class="row">
                                            <div class="col-12 text-center text-muted py-3">
                                                <i class="fas fa-spinner fa-spin"></i> Loading repositories...
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- GitHub Actions -->
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="card">
                                            <div class="card-header">
                                                <h6 class="mb-0"><i class="fas fa-cogs me-2"></i>GitHub Actions</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="d-flex gap-2">
                                                    <button class="btn btn-outline-dark" onclick="githubDashboard.refreshData()">
                                                        <i class="fas fa-sync-alt me-2"></i>Refresh Data
                                                    </button>
                                                    <button class="btn btn-outline-primary" onclick="githubDashboard.analyzeWithAI()">
                                                        <i class="fas fa-robot me-2"></i>Analyze with AI
                                                    </button>
                                                    <button class="btn btn-outline-success" onclick="githubDashboard.generateReport()">
                                                        <i class="fas fa-file-pdf me-2"></i>Generate Report
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after email dashboard
            const emailDashboard = document.getElementById('emailDashboard');
            if (emailDashboard) {
                emailDashboard.insertAdjacentHTML('afterend', githubHtml);
            }
            
            // Load GitHub data
            this.checkConnection();
            this.loadGitHubData();
        }
    }
    
    async checkConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/github/health`);
            const data = await response.json();
            
            const statusElement = document.getElementById('githubStatus');
            if (statusElement) {
                if (data.status === 'connected') {
                    statusElement.className = 'alert alert-success';
                    statusElement.innerHTML = `
                        <i class="fas fa-check-circle me-2"></i>
                        Connected to GitHub as <strong>${data.username}</strong>
                    `;
                } else {
                    statusElement.className = 'alert alert-danger';
                    statusElement.innerHTML = `
                        <i class="fas fa-times-circle me-2"></i>
                        Not connected: ${data.error || 'Unknown error'}
                        <br><small>Check your GitHub token in .env file</small>
                    `;
                }
            }
            
        } catch (error) {
            const statusElement = document.getElementById('githubStatus');
            if (statusElement) {
                statusElement.className = 'alert alert-danger';
                statusElement.innerHTML = `
                    <i class="fas fa-times-circle me-2"></i>
                    Connection failed: ${error.message}
                `;
            }
        }
    }
    
    async loadGitHubData() {
        try {
            // Load multiple data sources in parallel
            const [profileResponse, reposResponse, contributionsResponse, languagesResponse] = await Promise.all([
                fetch(`${this.backendUrl}/github/profile`),
                fetch(`${this.backendUrl}/github/repos`),
                fetch(`${this.backendUrl}/github/contributions`),
                fetch(`${this.backendUrl}/github/languages`)
            ]);
            
            this.userData = await profileResponse.json();
            this.repos = (await reposResponse.json()).repositories || [];
            this.contributions = await contributionsResponse.json();
            this.languages = await languagesResponse.json();
            
            // Update UI
            this.updateStats();
            this.renderLanguageChart();
            this.renderActivityTimeline();
            this.renderRepositoriesList();
            
            // Show stats section
            document.getElementById('githubStats').style.display = 'flex';
            
        } catch (error) {
            console.error('Failed to load GitHub data:', error);
        }
    }
    
    updateStats() {
        // Update stats cards
        document.getElementById('totalRepos').textContent = this.repos.length;
        document.getElementById('totalCommits').textContent = this.contributions.commit_count || 0;
        document.getElementById('totalPRs').textContent = this.contributions.pull_request_events || 0;
        
        // Calculate active repos (updated in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeRepos = this.repos.filter(repo => {
            const updated = new Date(repo.updated_at);
            return updated > thirtyDaysAgo;
        }).length;
        
        document.getElementById('activeRepos').textContent = activeRepos;
    }
    
    renderLanguageChart() {
        const container = document.getElementById('languageChart');
        if (!container) return;
        
        const languages = this.languages.percentages || {};
        
        if (Object.keys(languages).length === 0) {
            container.innerHTML = '<p class="text-muted">No language data available.</p>';
            return;
        }
        
        // Sort languages by percentage
        const sortedLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8); // Top 8 languages
        
        let chartHtml = '<div class="language-chart">';
        
        sortedLanguages.forEach(([lang, percentage]) => {
            const barWidth = Math.max(percentage * 2, 10); // Minimum 10px width for visibility
            
            chartHtml += `
                <div class="language-row mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="language-name">${lang}</span>
                        <span class="language-percent">${percentage}%</span>
                    </div>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${barWidth}%; background-color: ${this.getLanguageColor(lang)};">
                        </div>
                    </div>
                </div>
            `;
        });
        
        chartHtml += '</div>';
        container.innerHTML = chartHtml;
    }
    
    getLanguageColor(language) {
        const colors = {
            'Python': '#3572A5',
            'JavaScript': '#F1E05A',
            'TypeScript': '#2B7489',
            'Java': '#B07219',
            'C++': '#F34B7D',
            'C': '#555555',
            'Go': '#00ADD8',
            'Rust': '#DEA584',
            'HTML': '#E34C26',
            'CSS': '#563D7C',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Shell': '#89E051',
            'Swift': '#FFAC45',
            'Kotlin': '#F18E33'
        };
        
        return colors[language] || '#6C757D'; // Default gray
    }
    
    renderActivityTimeline() {
        const container = document.getElementById('activityTimeline');
        if (!container) return;
        
        // Get last 7 days of activity
        const last7Days = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days[dateStr] = this.contributions.last_90_days[dateStr] || { pushes: 0, pull_requests: 0, issues: 0, commits: 0 };
        }
        
        let timelineHtml = '<div class="activity-timeline">';
        
        Object.entries(last7Days).forEach(([date, activities]) => {
            const totalActivity = activities.pushes + activities.pull_requests + activities.issues;
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            
            timelineHtml += `
                <div class="activity-day mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>${dayName} (${date})</strong>
                        <span class="badge bg-primary">${totalActivity} events</span>
                    </div>
                    <div class="activity-details small text-muted">
                        ${activities.pushes > 0 ? `🚀 ${activities.pushes} pushes` : ''}
                        ${activities.pull_requests > 0 ? ` | 🔀 ${activities.pull_requests} PRs` : ''}
                        ${activities.issues > 0 ? ` | 🐛 ${activities.issues} issues` : ''}
                        ${activities.commits > 0 ? ` | 💾 ${activities.commits} commits` : ''}
                    </div>
                </div>
            `;
        });
        
        timelineHtml += '</div>';
        container.innerHTML = timelineHtml;
    }
    
    renderRepositoriesList() {
        const container = document.getElementById('repositoriesList');
        if (!container) return;
        
        const recentRepos = this.repos.slice(0, 6); // Show 6 most recent repos
        
        if (recentRepos.length === 0) {
            container.innerHTML = '<p class="text-muted">No repositories found.</p>';
            return;
        }
        
        let reposHtml = '';
        
        recentRepos.forEach(repo => {
            const updated = new Date(repo.updated_at);
            const daysAgo = Math.floor((new Date() - updated) / (1000 * 60 * 60 * 24));
            
            reposHtml += `
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">
                                <a href="${repo.html_url}" target="_blank" class="text-decoration-none">
                                    <i class="fab fa-github me-2"></i>${repo.name}
                                </a>
                            </h6>
                            <p class="card-text small">${repo.description || 'No description'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-secondary">${repo.language || 'Unknown'}</span>
                                <small class="text-muted">${daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</small>
                            </div>
                            <div class="mt-2">
                                <span class="small text-muted">
                                    <i class="fas fa-star me-1"></i> ${repo.stargazers_count}
                                    <i class="fas fa-code-branch ms-2 me-1"></i> ${repo.forks_count}
                                </span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-sm btn-outline-primary w-100" 
                                    onclick="githubDashboard.analyzeRepository('${repo.name}')">
                                <i class="fas fa-chart-bar me-2"></i>Analyze
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = reposHtml;
    }
    
    async refreshData() {
        const statusElement = document.getElementById('githubStatus');
        if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-sync fa-spin me-2"></i>Refreshing GitHub data...';
            statusElement.className = 'alert alert-info';
        }
        
        // Clear cache and reload
        this.cache = {};
        await this.loadGitHubData();
        
        this.showNotification('success', 'GitHub Data Refreshed', 'Your GitHub data has been updated.');
    }
    
    async analyzeWithAI() {
        // Use AI agent to analyze GitHub activity
        const task = `Analyze my GitHub activity: 
        Total repos: ${this.repos.length}
        Total commits: ${this.contributions.commit_count}
        Primary languages: ${Object.keys(this.languages.percentages || {}).join(', ')}
        
        Provide insights on:
        1. My strongest programming languages
        2. Suggestions for improvement
        3. Recommended next projects based on my activity`;
        
        if (window.agentUI) {
            document.getElementById('agentTaskInput').value = task;
            window.agentUI.executeTask();
            
            // Scroll to agent section
            document.getElementById('agentSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            this.showNotification('warning', 'AI Agent Not Available', 'Please ensure the AI agent is loaded.');
        }
    }
    
    async analyzeRepository(repoName) {
        const task = `Analyze GitHub repository ${repoName}. 
        Provide code quality assessment, technology stack analysis, and improvement suggestions.`;
        
        if (window.agentUI) {
            document.getElementById('agentTaskInput').value = task;
            window.agentUI.executeTask();
            
            document.getElementById('agentSection').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    async generateReport() {
        // Generate a GitHub activity report
        const reportData = {
            user: this.userData,
            stats: {
                totalRepos: this.repos.length,
                totalCommits: this.contributions.commit_count,
                totalPRs: this.contributions.pull_request_events,
                activeRepos: document.getElementById('activeRepos').textContent
            },
            languages: this.languages.percentages,
            recentActivity: this.contributions.last_90_days
        };
        
        // Send to backend for report generation
        try {
            const response = await fetch(`${this.backendUrl}/email/summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...reportData,
                    report_type: 'github_analysis'
                })
            });
            
            const result = await response.json();
            
            this.showNotification('success', 'Report Generated', 
                `GitHub report ${result.status === 'sent' ? 'sent via email' : 'saved to file'}.`);
                
        } catch (error) {
            this.showNotification('error', 'Report Generation Failed', error.message);
        }
    }
    
    showNotification(type, title, message) {
        if (window.automationDashboard && window.automationDashboard.showNotification) {
            window.automationDashboard.showNotification(type, title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize GitHub dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.githubDashboard = new GitHubDashboard('http://localhost:8000');
});