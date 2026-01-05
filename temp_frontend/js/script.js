
/*
CHANGES: Add smart memory mode toggle
- Option to use semantic memory
- Display semantic match count
- Memory type indicator
*/

class PortfolioChat {
    constructor() {
        this.conversationHistory = [];
    this.backendUrl = 'http://localhost:8000';
    this.sessionId = this.getOrCreateSessionId(); // NEW: Session management
    this.initializeEventListeners();
    this.loadPortfolioInfo();
    this.displayMemoryStatus(); // NEW: Show memory info
    this.useSmartMemory = true; // NEW: Toggle for semantic memory
    this.initializeMemoryToggle(); // NEW
    }

    initializeEventListeners() {
        // Enter key support
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async loadPortfolioInfo() {
        try {
            const response = await fetch(`${this.backendUrl}/portfolio`);
            const data = await response.json();
            console.log('Portfolio loaded:', data);
        } catch (error) {
            console.error('Error loading portfolio:', error);
        }
    }

    // Add new methods to PortfolioChat class
    getOrCreateSessionId() {
    // Get existing session ID or create new one
    let sessionId = localStorage.getItem('portfolio_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('portfolio_session_id', sessionId);
    }
    return sessionId;
}
// Add new method
initializeMemoryToggle() {
    // Create memory toggle UI if not exists
    if (!document.getElementById('memoryToggle')) {
        const toggleHtml = `
            <div class="memory-toggle">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="smartMemoryToggle" checked>
                    <label class="form-check-label" for="smartMemoryToggle">
                        <i class="fas fa-brain me-1"></i>Smart Memory
                    </label>
                    <small class="text-muted ms-2">(Uses embeddings for better recall)</small>
                </div>
            </div>
        `;
        
        const chatHeader = document.querySelector('.card-header');
        if (chatHeader) {
            chatHeader.insertAdjacentHTML('beforeend', toggleHtml);
            
            // Add event listener
            document.getElementById('smartMemoryToggle').addEventListener('change', (e) => {
                this.useSmartMemory = e.target.checked;
                this.showMemoryModeNotification();
            });
        }
    }
}

async displayMemoryStatus() {
    // Fetch and display memory info
    try {
        const response = await fetch(`${this.backendUrl}/memory/${this.sessionId}`);
        const data = await response.json();
        
        // Create memory status element if it doesn't exist
        let statusEl = document.getElementById('memoryStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'memoryStatus';
            statusEl.className = 'memory-status';
            document.querySelector('.chat-history').prepend(statusEl);
        }
        
        if (data.total_messages > 0) {
            statusEl.innerHTML = `
                <small class="text-muted">
                    <i class="fas fa-brain me-1"></i>
                    Remembering ${data.total_messages} messages from this conversation
                </small>
            `;
        }
    } catch (error) {
        console.log('Memory status not available yet');
    }
}

    
 // Update sendMessage method
async sendMessage() {
    const inputElement = document.getElementById('messageInput');
    const message = inputElement.value.trim();
    
    if (!message) return;
    
    inputElement.value = '';
    this.addMessage(message, 'user');
    this.showTypingIndicator();
    
    try {
        // Choose endpoint based on memory mode
        const endpoint = this.useSmartMemory ? '/chat_smart' : '/chat';
        
        const response = await fetch(
            `${this.backendUrl}${endpoint}?session_id=${this.sessionId}`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({content: message})
            }
        );
        
        const data = await response.json();
        this.hideTypingIndicator();
        
        if (data.status === 'success') {
            this.addMessage(data.reply, 'ai');
            
            // Enhanced status display
            this.displayEnhancedMemoryStatus(data);
        }
        
    } catch (error) {
        this.hideTypingIndicator();
        this.addMessage(`Error: ${error.message}`, 'ai');
    }
}

// New method for enhanced status
displayEnhancedMemoryStatus(data) {
    let statusEl = document.getElementById('memoryStatus');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'memoryStatus';
        statusEl.className = 'memory-status';
        document.querySelector('.chat-history').prepend(statusEl);
    }
    
    let statusText = '';
    if (this.useSmartMemory && data.semantic_matches > 0) {
        statusText = `
            <i class="fas fa-brain me-1"></i>
            Smart mode: Found ${data.semantic_matches} related memories +
            ${data.recent_memory_count || 0} recent messages
        `;
    } else {
        statusText = `
            <i class="fas fa-history me-1"></i>
            Standard mode: ${data.recent_memory_count || 0} messages in memory
        `;
    }
    
    statusEl.innerHTML = `<small class="text-muted">${statusText}</small>`;
}

// New method for mode notification
showMemoryModeNotification() {
    const mode = this.useSmartMemory ? 'Smart' : 'Standard';
    const icon = this.useSmartMemory ? 'fa-brain' : 'fa-history';
    
    this.addMessage(
        `Switched to <strong>${mode} Memory Mode</strong>. ` +
        `${this.useSmartMemory ? 'Now using semantic search for better context.' : 'Using recent conversation only.'}`,
        
    );
}

   
    addMessage(content, sender) {
        const chatHistory = document.getElementById('chatHistory');
        const messageDiv = document.createElement('div');
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-header">
                <i class="fas ${sender === 'ai' ? 'fa-robot' : 'fa-user'} me-2"></i>
                ${sender === 'ai' ? 'AI Assistant' : 'You'}
            </div>
            <div class="message-content">${content}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatHistory.appendChild(messageDiv);
        
        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    showTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'flex';
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    setQuickQuestion(question) {
        document.getElementById('messageInput').value = question;
        document.getElementById('messageInput').focus();
    }
}


// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioChat = new PortfolioChat();
});

// Global functions for HTML onclick handlers
function sendMessage() {
    if (window.portfolioChat) {
        window.portfolioChat.sendMessage();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function setQuickQuestion(question) {
    if (window.portfolioChat) {
        window.portfolioChat.setQuickQuestion(question);
    }
}
function toggleMemoryMode() {
    if (window.portfolioChat) {
        const toggle = document.getElementById('smartMemoryToggle');
        if (toggle) {
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change'));
        }
    }
}