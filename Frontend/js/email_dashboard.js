/**
 * EMAIL DASHBOARD - Day 7
 * Manage email notifications and reports
 */

class EmailDashboard {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.emailLogs = [];
        this.initializeDashboard();
    }
    
    initializeDashboard() {
        // Add email dashboard section
        if (!document.getElementById('emailDashboard')) {
            const emailHtml = `
                <div class="row mt-5" id="emailDashboard">
                    <div class="col-12">
                        <div class="card shadow-lg border-warning">
                            <div class="card-header bg-gradient-warning text-dark">
                                <h5 class="mb-0">
                                    <i class="fas fa-envelope me-2"></i>Email Notifications
                                    <span class="badge bg-success float-end">SendGrid</span>
                                </h5>
                                <small>Send automated emails and reports from your AI portfolio</small>
                            </div>
                            <div class="card-body">
                                <!-- Email Stats -->
                                <div class="row mb-4">
                                    <div class="col-md-3">
                                        <div class="card bg-primary text-white">
                                            <div class="card-body text-center">
                                                <h2 id="totalEmails">0</h2>
                                                <p class="mb-0">Total Sent</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-success text-white">
                                            <div class="card-body text-center">
                                                <h2 id="todayEmails">0</h2>
                                                <p class="mb-0">Today</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-info text-white">
                                            <div class="card-body text-center">
                                                <h2 id="successRate">0%</h2>
                                                <p class="mb-0">Success Rate</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card bg-secondary text-white">
                                            <div class="card-body text-center">
                                                <h2 id="serviceStatus">-</h2>
                                                <p class="mb-0">Service</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Send Test Emails -->
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header">
                                                <h6 class="mb-0"><i class="fas fa-paper-plane me-2"></i>Send Test Emails</h6>
                                            </div>
                                            <div class="card-body">
                                                <p class="small mb-3">Test email functionality with sample data</p>
                                                <div class="d-grid gap-2">
                                                    <button class="btn btn-outline-primary" onclick="emailDashboard.sendPortfolioSummary()">
                                                        <i class="fas fa-chart-line me-2"></i>Send Portfolio Summary
                                                    </button>
                                                    <button class="btn btn-outline-success" onclick="emailDashboard.sendAgentReport()">
                                                        <i class="fas fa-robot me-2"></i>Send Agent Report
                                                    </button>
                                                    <button class="btn btn-outline-warning" onclick="emailDashboard.testConnection()">
                                                        <i class="fas fa-wifi me-2"></i>Test Email Service
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header">
                                                <h6 class="mb-0"><i class="fas fa-cog me-2"></i>Configuration</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="mb-3">
                                                    <label class="form-label">Email Service</label>
                                                    <select id="emailService" class="form-select">
                                                        <option value="sendgrid">SendGrid (Production)</option>
                                                        <option value="file" selected>File Logging (Development)</option>
                                                        <option value="gmail">Gmail API</option>
                                                    </select>
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label">Send Reports</label>
                                                    <select id="reportFrequency" class="form-select">
                                                        <option value="daily">Daily at 9 AM</option>
                                                        <option value="weekly">Weekly on Monday</option>
                                                        <option value="never">Never (Manual Only)</option>
                                                    </select>
                                                </div>
                                                <button class="btn btn-sm btn-outline-secondary" onclick="emailDashboard.saveConfig()">
                                                    <i class="fas fa-save me-2"></i>Save Configuration
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Email Preview -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0"><i class="fas fa-eye me-2"></i>Email Preview</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="emailPreview" class="border rounded p-3 bg-light" 
                                             style="max-height: 300px; overflow-y: auto;">
                                            <p class="text-muted mb-0">Select an email type to see preview...</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Recent Emails -->
                                <div>
                                    <h6><i class="fas fa-history me-2"></i>Recent Email Activity</h6>
                                    <div id="emailActivity" class="border rounded p-3 bg-light" 
                                         style="max-height: 300px; overflow-y: auto;">
                                        <div class="text-center text-muted py-3">
                                            <i class="fas fa-spinner fa-spin"></i> Loading email activity...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after automation dashboard
            const automationSection = document.getElementById('automationSection');
            if (automationSection) {
                automationSection.insertAdjacentHTML('afterend', emailHtml);
            }
            
            // Load data
            this.loadEmailLogs();
            this.updateStats();
            
            // Set up preview buttons
            this.setupPreviewButtons();
        }
    }
    
    async loadEmailLogs() {
        try {
            const response = await fetch(`${this.backendUrl}/email/logs?days=7`);
            const data = await response.json();
            
            this.emailLogs = data.emails || [];
            this.displayEmailActivity();
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to load email logs:', error);
        }
    }
    
    updateStats() {
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayEmails = this.emailLogs.filter(log => 
            log.timestamp.includes(today)
        ).length;
        
        const successfulEmails = this.emailLogs.filter(log => 
            log.result && log.result.status === 'sent'
        ).length;
        
        const successRate = this.emailLogs.length > 0 
            ? Math.round((successfulEmails / this.emailLogs.length) * 100) 
            : 0;
        
        // Update UI
        document.getElementById('totalEmails').textContent = this.emailLogs.length;
        document.getElementById('todayEmails').textContent = todayEmails;
        document.getElementById('successRate').textContent = `${successRate}%`;
        
        // Determine service status
        const lastEmail = this.emailLogs[this.emailLogs.length - 1];
        const service = lastEmail && lastEmail.result 
            ? lastEmail.result.service || 'unknown' 
            : 'not configured';
        document.getElementById('serviceStatus').textContent = service;
    }
    
    displayEmailActivity() {
        const container = document.getElementById('emailActivity');
        if (!container) return;
        
        if (this.emailLogs.length === 0) {
            container.innerHTML = '<p class="text-muted mb-0">No emails sent yet.</p>';
            return;
        }
        
        const recentLogs = this.emailLogs.slice(-5).reverse(); // Last 5, newest first
        
        container.innerHTML = recentLogs.map(log => `
            <div class="email-log-item mb-2 p-2 rounded bg-white border-start border-${log.result.status === 'sent' ? 'success' : 'info'}">
                <div class="d-flex justify-content-between">
                    <strong>${log.type || 'email'}</strong>
                    <small class="text-muted">${this.formatTime(log.timestamp)}</small>
                </div>
                <div class="small">
                    <span class="badge bg-${log.result.status === 'sent' ? 'success' : 'info'}">
                        ${log.result.status || 'unknown'}
                    </span>
                    ${log.result.service ? `via ${log.result.service}` : ''}
                    ${log.result.file ? `(saved to file)` : ''}
                </div>
            </div>
        `).join('');
    }
    
    async sendPortfolioSummary() {
        try {
            const response = await fetch(`${this.backendUrl}/email/summary`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({test: true})
            });
            
            const result = await response.json();
            
            this.showNotification('success', 'Portfolio Summary Sent', 
                `Email ${result.status === 'sent' ? 'sent successfully' : 'saved to file'}.`);
            
            // Refresh logs
            setTimeout(() => this.loadEmailLogs(), 1000);
            
        } catch (error) {
            this.showNotification('error', 'Failed to Send', error.message);
        }
    }
    
    async sendAgentReport() {
        // Get latest agent task
        try {
            const agentResponse = await fetch(`${this.backendUrl}/agent/status`);
            const agentStatus = await agentResponse.json();
            
            const agentData = {
                task: "Daily Agent Execution Report",
                status: "completed",
                steps_executed: agentStatus.memory_entries || 0,
                results: agentStatus.recent_memory || []
            };
            
            const response = await fetch(`${this.backendUrl}/email/agent-report`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(agentData)
            });
            
            const result = await response.json();
            
            this.showNotification('success', 'Agent Report Sent', 
                `Agent report ${result.status === 'sent' ? 'sent successfully' : 'saved to file'}.`);
            
            setTimeout(() => this.loadEmailLogs(), 1000);
            
        } catch (error) {
            this.showNotification('error', 'Failed to Send', error.message);
        }
    }
    
    async testConnection() {
        try {
            // Test by sending a simple email
            const response = await fetch(`${this.backendUrl}/email/summary`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    test: true,
                    chat_count: 1,
                    agent_tasks: 1,
                    memory_entries: 1,
                    ai_summary: "This is a test email to verify your email service is working correctly."
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'sent') {
                this.showNotification('success', 'Connection Test Passed', 
                    `Email sent successfully via ${result.service}. Check your inbox.`);
            } else if (result.status === 'saved_to_file') {
                this.showNotification('info', 'Development Mode Active', 
                    'Email saved to file (SendGrid not configured). Check backend/emails/ folder.');
            }
            
            setTimeout(() => this.loadEmailLogs(), 1000);
            
        } catch (error) {
            this.showNotification('error', 'Connection Test Failed', error.message);
        }
    }
    
    setupPreviewButtons() {
        // Add preview buttons
        const previewContainer = document.getElementById('emailPreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="d-flex gap-2 mb-3">
                    <button class="btn btn-sm btn-outline-primary" onclick="emailDashboard.previewEmail('summary')">
                        Preview Portfolio Summary
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="emailDashboard.previewEmail('agent')">
                        Preview Agent Report
                    </button>
                </div>
                <div id="previewContent"></div>
            `;
        }
    }
    
    previewEmail(type) {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;
        
        if (type === 'summary') {
            previewContent.innerHTML = `
                <div class="border rounded p-3 bg-white">
                    <h6>Portfolio Summary Email Preview</h6>
                    <hr>
                    <p><strong>Subject:</strong> 📊 AI Portfolio Summary - ${new Date().toLocaleDateString()}</p>
                    <p><strong>Content:</strong> Daily overview with stats, AI insights, and recent activity.</p>
                    <p class="small text-muted">HTML version includes professional styling with charts and sections.</p>
                </div>
            `;
        } else if (type === 'agent') {
            previewContent.innerHTML = `
                <div class="border rounded p-3 bg-white">
                    <h6>Agent Report Email Preview</h6>
                    <hr>
                    <p><strong>Subject:</strong> 🤖 AI Agent Daily Report - ${new Date().toLocaleDateString()}</p>
                    <p><strong>Content:</strong> Task execution details, steps completed, and results.</p>
                    <p class="small text-muted">Includes step-by-step breakdown of agent execution.</p>
                </div>
            `;
        }
    }
    
    saveConfig() {
        const service = document.getElementById('emailService').value;
        const frequency = document.getElementById('reportFrequency').value;
        
        // Save to localStorage (in production, save to backend)
        localStorage.setItem('emailConfig', JSON.stringify({ service, frequency }));
        
        this.showNotification('success', 'Configuration Saved', 
            `Email service: ${service}, Reports: ${frequency}`);
    }
    
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    showNotification(type, title, message) {
        // Use existing notification system
        if (window.automationDashboard && window.automationDashboard.showNotification) {
            window.automationDashboard.showNotification(type, title, message);
        } else {
            // Simple alert fallback
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize email dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.emailDashboard = new EmailDashboard('http://localhost:8000');
});