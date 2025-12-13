// async function sendMessage() {
//     const input = document.getElementById('messageInput');
//     const message = input.value.trim();

//     if (!message) return;

//     // Add user message to chat
//     addMessage(message, 'user');
//     input.value = '';

//     // Send to backend
//     const response = await fetch('http://localhost:8000/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content: message })
//     });

//     const data = await response.json();
//     addMessage(data.reply, 'ai');
// }

// function addMessage(text, sender) {
//     const chat = document.getElementById('chatHistory');
//     const msgDiv = document.createElement('div');
//     msgDiv.className = `${sender}-message p-2 rounded mb-2`;
//     msgDiv.textContent = text;
//     chat.appendChild(msgDiv);
//     chat.scrollTop = chat.scrollHeight;
// }

// Portfolio AI Chat Application
// Day 2: Real AI Integration

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

    async sendMessage() {
        const inputElement = document.getElementById('messageInput');
        const message = inputElement.value.trim();
        
        if (!message) return;
        
        // Clear input
        inputElement.value = '';
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Prepare conversation history for context
            const historyForApi = this.conversationHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
            
            // Send to backend
            const response = await fetch(`${this.backendUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: message,
                    conversation_history: historyForApi
                })
            });
            
            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            if (data.status === 'success') {
                // Add AI response to chat
                this.addMessage(data.reply, 'ai');
                
                // Update conversation history
                this.conversationHistory.push(
                    { sender: 'user', content: message },
                    { sender: 'ai', content: data.reply }
                );
                
                // Keep last 10 messages in history
                if (this.conversationHistory.length > 10) {
                    this.conversationHistory = this.conversationHistory.slice(-10);
                }
            } else {
                throw new Error(data.detail || 'Unknown error');
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessage(`Sorry, I encountered an error: ${error.message}. Please check your backend connection and API key.`, 'ai');
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