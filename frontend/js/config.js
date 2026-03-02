/**
 * Global Configuration
 * Dynamically sets API base URL based on environment
 * Uses Vite environment variables
 */

const CONFIG = (() => {
    const hostname = window.location.hostname;
    
    // Try to use Vite environment variable first (from .env files)
    const viateApiUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL;
    
    // Development (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            API_BASE: viateApiUrl || 'http://localhost:8000',
            ENV: 'development'
        };
    }
    
    // Production (Vercel domain)
    if (hostname.includes('vercel.app')) {
        if (!viateApiUrl) {
            console.warn('⚠️ VITE_API_URL not set! Set it in .env.production');
        }
        return {
            API_BASE: viateApiUrl || 'https://ai-portfolio-backend-production.up.railway.app',
            ENV: 'production'
        };
    }
    
    // Custom domain (production)
    if (hostname === 'yourdomain.com' || hostname === 'www.yourdomain.com') {
        return {
            API_BASE: viateApiUrl || 'https://ai-portfolio-backend-production.up.railway.app',
            ENV: 'production'
        };
    }
    
    // Fallback to production
    console.warn('⚠️ Unknown environment:', hostname, '- Using production API');
    return {
        API_BASE: viateApiUrl || 'https://ai-portfolio-backend-production.up.railway.app',
        ENV: 'production'
    };
})();

// Remove trailing slash if present to avoid double slashes in API calls
CONFIG.API_BASE = CONFIG.API_BASE.replace(/\/$/, '');

// Log for debugging
console.log(`📍 Environment: ${CONFIG.ENV} | API: ${CONFIG.API_BASE}`);
