
// Add at top of PortfolioChat class
constructor() {
    this.conversationHistory = [];
    this.backendUrl = 'http://localhost:8000';
    this.sessionId = this.getOrCreateSessionId(); // NEW: Session management
    this.initializeEventListeners();
    this.loadPortfolioInfo();
    this.displayMemoryStatus(); // NEW: Show memory info
}

class PortfolioChat {
    constructor() {
        this.conversationHistory = [];
        this.backendUrl = 'http://localhost:8000'; // FastAPI backend
        this.initializeEventListeners();
        this.loadPortfolioInfo();
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
        // Send with session_id
        const response = await fetch(`${this.backendUrl}/chat?session_id=${this.sessionId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content: message})
        });
        
        const data = await response.json();
        this.hideTypingIndicator();
        
        if (data.status === 'success') {
            this.addMessage(data.reply, 'ai');
            // Update memory status display
            this.displayMemoryStatus();
        }
        
    } catch (error) {
        this.hideTypingIndicator();
        this.addMessage(`Error: ${error.message}`, 'ai');
    }
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