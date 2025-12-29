/**
 * AUTOMATION DASHBOARD - Day 6
 * Interface for managing n8n workflows
 */

class AutomationDashboard {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.workflows = [];
        this.initializeDashboard();
    }
    
    initializeDashboard() {
        // Add automation section to page
        if (!document.getElementById('automationSection')) {
            const automationHtml = `
                <div class="row mt-5" id="automationSection">
                    <div class="col-12">
                        <div class="card shadow-lg border-success">
                            <div class="card-header bg-gradient-success text-white">
                                <h5 class="mb-0">
                                    <i class="fas fa-robot me-2"></i>AI Automation Dashboard
                                    <span class="badge bg-warning float-end">n8n</span>
                                </h5>
                                <small>Schedule AI tasks and monitor automated workflows</small>
                            </div>
                            <div class="card-body">
                                <!-- Workflow Status -->
                                <div class="row mb-4">
                                    <div class="col-md-3">
                                        <div class="card bg-primary text-white">
                                            <div class="card-body text-center">
                                                <h2 id="activeWorkflows">0</h2>
                                                <p class="mb-0">Active Workflows</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-info text-white">
                                            <div class="card-body text-center">
                                                <h2 id="totalRuns">0</h2>
                                                <p class="mb-0">Total Runs</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-warning text-white">
                                            <div class="card-body text-center">
                                                <h2 id="successRate">0%</h2>
                                                <p class="mb-0">Success Rate</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-secondary text-white">
                                            <div class="card-body text-center">
                                                <h2 id="scheduledTasks">0</h2>
                                                <p class="mb-0">Scheduled</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Schedule New Task -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0"><i class="fas fa-clock me-2"></i>Schedule AI Task</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-8">
                                                <div class="mb-3">
                                                    <label class="form-label">Task Description</label>
                                                    <input type="text" id="taskDescription" 
                                                           class="form-control" 
                                                           placeholder="Example: Generate daily learning summary">
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mb-3">
                                                    <label class="form-label">Schedule</label>
                                                    <select id="scheduleType" class="form-select">
                                                        <option value="daily">Daily (9 AM)</option>
                                                        <option value="weekly">Weekly (Monday 9 AM)</option>
                                                        <option value="custom">Custom Cron</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div id="customCronSection" class="mb-3" style="display: none;">
                                            <label class="form-label">Cron Expression</label>
                                            <input type="text" id="cronExpression" 
                                                   class="form-control" 
                                                   placeholder="0 9 * * * (Every day at 9 AM)">
                                            <small class="text-muted">Format: minute hour day month weekday</small>
                                        </div>
                                        <button class="btn btn-success" onclick="automationDashboard.scheduleTask()">
                                            <i class="fas fa-calendar-plus me-2"></i>Schedule Task
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Workflow Templates -->
                                <div class="mb-4">
                                    <h6><i class="fas fa-layer-group me-2"></i>Workflow Templates</h6>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="card h-100">
                                                <div class="card-body">
                                                    <h6>Daily Summary</h6>
                                                    <p class="small">AI generates daily learning and portfolio summary</p>
                                                    <button class="btn btn-sm btn-outline-primary" 
                                                            onclick="automationDashboard.activateTemplate('daily-summary')">
                                                        Activate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="card h-100">
                                                <div class="card-body">
                                                    <h6>Code Review</h6>
                                                    <p class="small">Automatically analyze new code commits</p>
                                                    <button class="btn btn-sm btn-outline-primary"
                                                            onclick="automationDashboard.activateTemplate('code-review')">
                                                        Activate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="card h-100">
                                                <div class="card-body">
                                                    <h6>Progress Report</h6>
                                                    <p class="small">Weekly progress report with statistics</p>
                                                    <button class="btn btn-sm btn-outline-primary"
                                                            onclick="automationDashboard.activateTemplate('weekly-report')">
                                                        Activate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Activity Log -->
                                <div>
                                    <h6><i class="fas fa-history me-2"></i>Recent Activity</h6>
                                    <div id="activityLog" class="border rounded p-3 bg-light" 
                                         style="max-height: 300px; overflow-y: auto;">
                                        <div class="text-center text-muted py-3">
                                            <i class="fas fa-spinner fa-spin"></i> Loading activity...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after agent section
            const agentSection = document.getElementById('agentSection');
            if (agentSection) {
                agentSection.insertAdjacentHTML('afterend', automationHtml);
            }
            
            // Add event listener for schedule type change
            document.getElementById('scheduleType').addEventListener('change', (e) => {
                const customSection = document.getElementById('customCronSection');
                customSection.style.display = e.target.value === 'custom' ? 'block' : 'none';
            });
            
            // Load initial data
            this.loadDashboardData();
            this.loadActivityLog();
            
            // Start polling for updates
            setInterval(() => this.loadDashboardData(), 30000); // Every 30 seconds
        }
    }
    
    async loadDashboardData() {
        try {
            // Load scheduled tasks
            const tasksResponse = await fetch(`${this.backendUrl}/n8n/scheduled`);
            const tasksData = await tasksResponse.json();
            
            // Update dashboard stats
            document.getElementById('scheduledTasks').textContent = tasksData.count || 0;
            document.getElementById('activeWorkflows').textContent = Object.keys(tasksData.tasks || {}).length;
            
            // Mock data for demo (in real app, track these)
            document.getElementById('totalRuns').textContent = '24';
            document.getElementById('successRate').textContent = '92%';
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }
    
    async loadActivityLog() {
        try {
            // For demo, use mock data
            const activities = [
                {time: '10:30 AM', action: 'Daily summary generated', status: 'success'},
                {time: '9:00 AM', action: 'Code review completed', status: 'success'},
                {time: 'Yesterday', action: 'Weekly report sent', status: 'success'},
                {time: '2 days ago', action: 'Database backup failed', status: 'error'},
                {time: '3 days ago', action: 'Learning tracker updated', status: 'success'},
            ];
            
            const logContainer = document.getElementById('activityLog');
            if (logContainer) {
                logContainer.innerHTML = activities.map(activity => `
                    <div class="activity-item mb-2 p-2 rounded ${activity.status === 'error' ? 'bg-danger-light' : 'bg-success-light'}">
                        <div class="d-flex justify-content-between">
                            <span><i class="fas fa-${activity.status === 'success' ? 'check-circle text-success' : 'times-circle text-danger'} me-2"></i>
                            ${activity.action}</span>
                            <small class="text-muted">${activity.time}</small>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load activity log:', error);
        }
    }
    
    async scheduleTask() {
        const description = document.getElementById('taskDescription').value;
        const scheduleType = document.getElementById('scheduleType').value;
        
        if (!description.trim()) {
            alert('Please enter a task description');
            return;
        }
        
        // Determine cron expression
        let cron = '0 9 * * *'; // Default: daily at 9 AM
        if (scheduleType === 'weekly') {
            cron = '0 9 * * 1'; // Monday at 9 AM
        } else if (scheduleType === 'custom') {
            cron = document.getElementById('cronExpression').value;
            if (!cron.trim()) {
                alert('Please enter a cron expression');
                return;
            }
        }
        
        try {
            const response = await fetch(`${this.backendUrl}/n8n/schedule`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    task: description,
                    cron: cron,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });
            
            const result = await response.json();
            
            // Show success message
            this.showNotification('success', 'Task Scheduled', 
                `Task scheduled successfully. Next run: ${new Date(result.scheduled.next_run).toLocaleString()}`);
            
            // Refresh dashboard
            this.loadDashboardData();
            
            // Clear form
            document.getElementById('taskDescription').value = '';
            
        } catch (error) {
            this.showNotification('error', 'Scheduling Failed', error.message);
        }
    }
    
    async activateTemplate(templateName) {
        const templates = {
            'daily-summary': {
                task: 'Generate daily summary of learning progress and portfolio activity',
                cron: '0 9 * * *'
            },
            'code-review': {
                task: 'Analyze recent code changes and suggest improvements',
                cron: '0 18 * * *' // 6 PM daily
            },
            'weekly-report': {
                task: 'Generate weekly progress report with statistics and insights',
                cron: '0 9 * * 1' // Monday at 9 AM
            }
        };
        
        const template = templates[templateName];
        if (!template) return;
        
        // Pre-fill form
        document.getElementById('taskDescription').value = template.task;
        document.getElementById('cronExpression').value = template.cron;
        document.getElementById('scheduleType').value = 'custom';
        document.getElementById('customCronSection').style.display = 'block';
        
        this.showNotification('info', 'Template Loaded', 
            `"${templateName}" template loaded. Click "Schedule Task" to activate.`);
    }
    
    showNotification(type, title, message) {
        // Use existing notification system or create simple alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            <strong>${title}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.card-body');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.classList.remove('show');
                    setTimeout(() => alert.remove(), 150);
                }
            }, 5000);
        }
    }
}

// Initialize automation dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.automationDashboard = new AutomationDashboard('http://localhost:8000');
});