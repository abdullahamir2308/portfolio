/**
 * BASIC ANALYTICS - Day 11 (Optional)
 * Track page views and interactions
 */

class PortfolioAnalytics {
    constructor() {
        this.endpoint = import.meta.env.VITE_API_URL || 'http://localhost:8000/analytics'; // Your backend endpoint
        this.userId = this.getUserId();
        this.initialize();
    }
    
    initialize() {
        // Track page view
        this.trackEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer,
            user_agent: navigator.userAgent
        });
        
        // Track dashboard interactions
        this.setupInteractionTracking();
    }
    
    getUserId() {
        let userId = localStorage.getItem('portfolio_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('portfolio_user_id', userId);
        }
        return userId;
    }
    
    async trackEvent(eventType, data = {}) {
        const eventData = {
            event_type: eventType,
            user_id: this.userId,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        // Send to backend (optional)
        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            // Fail silently in development
            console.log('Analytics event:', eventType, eventData);
        }
        
        // Also log to console for development
        if (window.location.hostname === 'localhost') {
            console.log(`📊 Analytics: ${eventType}`, eventData);
        }
    }
    
    setupInteractionTracking() {
        // Track chat messages
        const originalSendMessage = window.portfolioChat?.sendMessage;
        if (originalSendMessage) {
            window.portfolioChat.sendMessage = async function() {
                const input = document.getElementById('messageInput');
                if (input?.value) {
                    window.portfolioAnalytics?.trackEvent('chat_message', {
                        message_length: input.value.length
                    });
                }
                return originalSendMessage.apply(this, arguments);
            };
        }
        
        // Track agent tasks
        document.addEventListener('click', (e) => {
            if (e.target.closest('[onclick*="executeTask"]')) {
                this.trackEvent('agent_task_executed');
            }
            
            if (e.target.closest('[onclick*="sendPortfolioSummary"]')) {
                this.trackEvent('email_sent', { type: 'portfolio_summary' });
            }
        });
        
        // Track mode changes
        const modeToggle = document.getElementById('portfolioModeToggle');
        if (modeToggle) {
            modeToggle.addEventListener('change', (e) => {
                this.trackEvent('mode_changed', {
                    mode: e.target.checked ? 'recruiter' : 'personal'
                });
            });
        }
    }
}

// Initialize analytics
if (window.location.hostname !== 'localhost' || true) { // Enable in production
    document.addEventListener('DOMContentLoaded', () => {
        window.portfolioAnalytics = new PortfolioAnalytics();
    });
}