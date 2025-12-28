/*
AI AGENT INTERFACE - Day 5
Separate file for agent functionality to keep code organized
*/

class PortfolioAgentUI {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.agentActive = false;
        this.currentTask = null;
        this.initializeUI();
    }
    
    initializeUI() {
        // Create agent section if not exists
        if (!document.getElementById('agentSection')) {
            const agentHtml = `
                <div class="row mt-5" id="agentSection">
                    <div class="col-12">
                        <div class="card shadow-lg border-primary">
                            <div class="card-header bg-gradient-primary text-white">
                                <h5 class="mb-0">
                                    <i class="fas fa-robot me-2"></i>AI Agent Assistant
                                    <span class="badge bg-warning float-end">BETA</span>
                                </h5>
                                <small>Autonomous task executor - Can use tools to accomplish complex tasks</small>
                            </div>
                            <div class="card-body">
                                <!-- Agent Status Display -->
                                <div class="agent-status mb-4">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span class="badge bg-info" id="agentStatusBadge">Idle</span>
                                            <small class="text-muted ms-2" id="agentStatusText">Ready for tasks</small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-primary" onclick="agentUI.refreshStatus()">
                                            <i class="fas fa-sync-alt"></i> Refresh
                                        </button>
                                    </div>
                                    <div class="progress mt-2" style="height: 5px;">
                                        <div id="agentProgress" class="progress-bar progress-bar-striped progress-bar-animated" 
                                             style="width: 0%"></div>
                                    </div>
                                </div>
                                
                                <!-- Task Input -->
                                <div class="mb-3">
                                    <label class="form-label">Agent Task</label>
                                    <div class="input-group">
                                        <input type="text" id="agentTaskInput" 
                                               class="form-control" 
                                               placeholder="Example: Summarize my learning progress and analyze my code quality">
                                        <button class="btn btn-primary" onclick="agentUI.executeTask()">
                                            <i class="fas fa-play"></i> Execute
                                        </button>
                                    </div>
                                    <small class="text-muted">The agent will break this down into steps and use tools automatically</small>
                                </div>
                                
                                <!-- Quick Tasks -->
                                <div class="mb-4">
                                    <small class="text-muted d-block mb-2">Try these agent tasks:</small>
                                    <div class="d-flex flex-wrap gap-2">
                                        <button class="btn btn-sm btn-outline-secondary" 
                                                onclick="agentUI.setTask('Summarize my portfolio progress and suggest improvements')">
                                            <i class="fas fa-chart-line me-1"></i> Progress Report
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary"
                                                onclick="agentUI.setTask('Analyze my JavaScript code for best practices')">
                                            <i class="fas fa-code me-1"></i> Code Review
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary"
                                                onclick="agentUI.setTask('Generate documentation for my AI agent system')">
                                            <i class="fas fa-book me-1"></i> Generate Docs
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Results Display -->
                                <div class="agent-results">
                                    <h6><i class="fas fa-tasks me-2"></i>Execution Results</h6>
                                    <div id="agentResults" class="border rounded p-3 bg-light" 
                                         style="min-height: 200px; max-height: 400px; overflow-y: auto;">
                                        <p class="text-muted mb-0">Agent results will appear here...</p>
                                    </div>
                                </div>
                                
                                <!-- Available Tools -->
                                <div class="mt-4">
                                    <h6><i class="fas fa-tools me-2"></i>Available Tools</h6>
                                    <div id="agentTools" class="d-flex flex-wrap gap-2">
                                        <!-- Tools will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after chat section
            const chatSection = document.querySelector('.row .col-lg-8');
            if (chatSection) {
                chatSection.parentNode.insertAdjacentHTML('afterend', agentHtml);
            }
            
            // Load tools
            this.loadAvailableTools();
            this.refreshStatus();
        }
    }
    
    async loadAvailableTools() {
        try {
            const response = await fetch(`${this.backendUrl}/agent/tools`);
            const data = await response.json();
            
            const toolsContainer = document.getElementById('agentTools');
            if (toolsContainer && data.tools) {
                toolsContainer.innerHTML = data.tools.map(tool => `
                    <div class="tool-card" style="width: 200px;">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-title">
                                    <i class="fas fa-toolbox text-primary me-2"></i>${tool.name}
                                </h6>
                                <p class="card-text small">${tool.description}</p>
                                <small class="text-muted">${tool.example}</small>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load tools:', error);
        }
    }
    
    async refreshStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/agent/status`);
            const data = await response.json();
            
            // Update UI
            const badge = document.getElementById('agentStatusBadge');
            const text = document.getElementById('agentStatusText');
            
            if (badge && text) {
                badge.textContent = data.status.charAt(0).toUpperCase() + data.status.slice(1);
                badge.className = `badge bg-${this.getStatusColor(data.status)}`;
                
                text.textContent = `Tools: ${data.available_tools.length} | Memory: ${data.memory_entries} entries`;
            }
        } catch (error) {
            console.error('Failed to refresh agent status:', error);
        }
    }
    
    getStatusColor(status) {
        const colors = {
            'thinking': 'info',
            'acting': 'warning',
            'completed': 'success',
            'error': 'danger',
            'idle': 'secondary'
        };
        return colors[status] || 'secondary';
    }
    
    setTask(task) {
        document.getElementById('agentTaskInput').value = task;
    }
    
    async executeTask() {
        const taskInput = document.getElementById('agentTaskInput');
        const task = taskInput.value.trim();
        
        if (!task) {
            alert('Please enter a task for the agent');
            return;
        }
        
        // Disable input during execution
        taskInput.disabled = true;
        this.agentActive = true;
        this.currentTask = task;
        
        // Update UI
        this.updateProgress(10, 'Planning task...');
        
        try {
            // Execute task
            const response = await fetch(`${this.backendUrl}/agent/task`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({task: task})
            });
            
            const result = await response.json();
            
            // Display results
            this.displayResults(result);
            this.updateProgress(100, 'Task completed!');
            
        } catch (error) {
            this.displayError(error);
            this.updateProgress(0, 'Task failed');
        } finally {
            // Re-enable input
            taskInput.disabled = false;
            this.agentActive = false;
            this.refreshStatus();
            
            // Reset progress after delay
            setTimeout(() => {
                this.updateProgress(0, 'Ready for next task');
            }, 3000);
        }
    }
    
    updateProgress(percent, message) {
        const progressBar = document.getElementById('agentProgress');
        const statusText = document.getElementById('agentStatusText');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
            progressBar.textContent = `${percent}%`;
        }
        
        if (statusText) {
            statusText.textContent = message;
        }
    }
    
    displayResults(result) {
        const resultsContainer = document.getElementById('agentResults');
        
        if (resultsContainer) {
            let html = `
                <div class="alert alert-success">
                    <strong>Task Completed:</strong> ${result.task}
                </div>
                <p><strong>Status:</strong> <span class="badge bg-success">${result.status}</span></p>
                <p><strong>Steps Executed:</strong> ${result.steps_executed}</p>
                <hr>
                <h6>Execution Steps:</h6>
                <div class="list-group">
            `;
            
            if (result.results && result.results.length > 0) {
                result.results.forEach((stepResult, index) => {
                    html += `
                        <div class="list-group-item">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">Step ${index + 1}</h6>
                                <small>${stepResult.includes('Error') ? '❌' : '✅'}</small>
                            </div>
                            <p class="mb-1 small">${stepResult}</p>
                        </div>
                    `;
                });
            } else {
                html += `<p class="text-muted">No steps were executed.</p>`;
            }
            
            html += `
                </div>
                <hr>
                <h6>Agent Memory (Recent):</h6>
                <ul class="small">
            `;
            
            if (result.agent_memory && result.agent_memory.length > 0) {
                result.agent_memory.forEach(memory => {
                    html += `<li>${memory}</li>`;
                });
            }
            
            html += `</ul>`;
            
            resultsContainer.innerHTML = html;
            resultsContainer.scrollTop = 0;
        }
    }
    
    displayError(error) {
        const resultsContainer = document.getElementById('agentResults');
        
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Agent Error:</strong> ${error.message || 'Unknown error'}
                </div>
                <p>Check if:</p>
                <ul>
                    <li>Backend server is running</li>
                    <li>OpenAI API key is valid</li>
                    <li>Task is clear and achievable</li>
                </ul>
            `;
        }
    }
}

// Initialize agent UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.agentUI = new PortfolioAgentUI('http://localhost:8000');
});