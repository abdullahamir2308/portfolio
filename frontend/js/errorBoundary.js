/**
 * ERROR BOUNDARY - Day 10
 * Catches JavaScript errors and displays fallback UI
 */

class ErrorBoundary {
    constructor(componentId, fallbackHtml = null) {
        this.componentId = componentId;
        this.fallbackHtml = fallbackHtml || this.defaultFallback();
        this.initialize();
    }
    
    initialize() {
        // Wrap the component's content
        const component = document.getElementById(this.componentId);
        if (component) {
            const originalContent = component.innerHTML;
            
            component.innerHTML = `
                <div class="error-boundary" data-original-content="${this.encodeContent(originalContent)}">
                    ${originalContent}
                </div>
            `;
            
            // Add error event listener
            window.addEventListener('error', (event) => {
                if (event.target.closest(`#${this.componentId}`)) {
                    this.handleError(event.error, component);
                }
            });
        }
    }
    
    handleError(error, component) {
        console.error(`Error in ${this.componentId}:`, error);
        
        const errorBoundary = component.querySelector('.error-boundary');
        if (errorBoundary) {
            errorBoundary.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="fas fa-exclamation-triangle me-2"></i>Something went wrong</h5>
                    <p>${error.message || 'An unexpected error occurred'}</p>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="location.reload()">
                            <i class="fas fa-redo me-1"></i>Reload Page
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="this.closest('.error-boundary').innerHTML = atob(this.closest('.error-boundary').dataset.originalContent)">
                            <i class="fas fa-eye me-1"></i>Show Original Content
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    defaultFallback() {
        return `
            <div class="error-fallback">
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-circle fa-3x text-warning mb-3"></i>
                    <h4>Component Error</h4>
                    <p class="text-muted">This section failed to load properly.</p>
                    <button class="btn btn-primary mt-2" onclick="location.reload()">
                        Reload Application
                    </button>
                </div>
            </div>
        `;
    }
    
    encodeContent(content) {
        return btoa(encodeURIComponent(content));
    }
    
    static wrapAllComponents() {
        // Wrap key components with error boundaries
        const components = [
            'chatHistory', 'agentResults', 'emailActivity', 
            'agentTools', 'githubStats', 'automationSection'
        ];
        
        components.forEach(componentId => {
            if (document.getElementById(componentId)) {
                new ErrorBoundary(componentId);
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    ErrorBoundary.wrapAllComponents();
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Show global error toast if available
    if (window.showErrorToast) {
        window.showErrorToast(event.error.message || 'An unexpected error occurred');
    }
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});