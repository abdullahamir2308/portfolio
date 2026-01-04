/**
 * Switch between professional portfolio and personal assistant modes
 */

class PortfolioModeManager {
    constructor() {
        this.currentMode = this.getSavedMode() || 'recruiter'; // recruiter | personal
        this.initialize();
    }
    
    initialize() {
        this.createModeToggle();
        this.applyMode(this.currentMode);
        this.setupEventListeners();
    }
    
    createModeToggle() {
        // Add toggle to navbar
        const navbar = document.querySelector('.navbar .container');
        if (navbar && !document.getElementById('modeToggleContainer')) {
            const toggleHtml = `
                <div class="ms-auto" id="modeToggleContainer">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="portfolioModeToggle">
                        <label class="form-check-label text-white" for="portfolioModeToggle">
                            <i class="fas fa-user-tie me-1"></i>Recruiter Mode
                        </label>
                        <small class="text-white-50 d-block">Professional View</small>
                    </div>
                </div>
            `;
            navbar.insertAdjacentHTML('beforeend', toggleHtml);
            
            // Set initial state
            document.getElementById('portfolioModeToggle').checked = this.currentMode === 'recruiter';
        }
    }
    
    setupEventListeners() {
        document.getElementById('portfolioModeToggle')?.addEventListener('change', (e) => {
            const mode = e.target.checked ? 'recruiter' : 'personal';
            this.setMode(mode);
            this.showModeNotification(mode);
        });
    }
    
    setMode(mode) {
        this.currentMode = mode;
        localStorage.setItem('portfolioMode', mode);
        this.applyMode(mode);
    }
    
    getSavedMode() {
        return localStorage.getItem('portfolioMode');
    }
    
    applyMode(mode) {
        // Add mode class to body
        document.body.classList.remove('recruiter-mode', 'personal-mode');
        document.body.classList.add(`${mode}-mode`);
        
        // Hide/show personal features
        this.togglePersonalFeatures(mode === 'recruiter');
        
        // Update UI text
        this.updateModeIndicators(mode);
    }
    
    togglePersonalFeatures(hidePersonal) {
        const personalSections = [
            'automationSection',  // n8n automation
            'emailDashboard',     // Email system
            // We'll add Job Assistant here later
        ];
        
        personalSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = hidePersonal ? 'none' : 'block';
            }
        });
        
        // Also hide personal tools in AI agent
        if (window.portfolioChat) {
            window.portfolioChat.setRecruiterMode(hidePersonal);
        }
    }
    
    updateModeIndicators(mode) {
        const toggle = document.getElementById('portfolioModeToggle');
        const label = document.querySelector('label[for="portfolioModeToggle"]');
        
        if (toggle && label) {
            if (mode === 'recruiter') {
                label.innerHTML = '<i class="fas fa-user-tie me-1"></i>Recruiter Mode';
                label.nextElementSibling.textContent = 'Professional View';
                toggle.checked = true;
            } else {
                label.innerHTML = '<i class="fas fa-robot me-1"></i>Personal Mode';
                label.nextElementSibling.textContent = 'Full Features';
                toggle.checked = false;
            }
        }
    }
    
    showModeNotification(mode) {
        const messages = {
            'recruiter': 'Switched to Recruiter Mode: Showing professional portfolio only.',
            'personal': 'Switched to Personal Mode: All features enabled.'
        };
        
        // Use existing notification system or create simple alert
        if (window.portfolioChat) {
            window.portfolioChat.addMessage(messages[mode], 'system');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioMode = new PortfolioModeManager();
});