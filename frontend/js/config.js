/**
 * Global Configuration
 * Dynamically sets API base URL based on environment
 */

const CONFIG = (() => {
    const hostname = window.location.hostname;
    
    // Development (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            API_BASE: 'http://localhost:8000',
            ENV: 'development'
        };
    }
    
    // Production (Vercel domain)
    if (hostname.includes('vercel.app')) {
        return {
            API_BASE: 'https://ai-portfilio-backend-production.up.railway.app/',
            ENV: 'production'
        };
    }
    
    // Custom domain (production)
    if (hostname === 'yourdomain.com' || hostname === 'www.yourdomain.com') {
        return {
            API_BASE: 'https://ai-portfilio-backend-production.up.railway.app/',
            ENV: 'production'
        };
    }
    
    // Fallback to production
    console.warn('⚠️ Unknown environment:', hostname, '- Using production API');
    return {
        API_BASE: 'https://ai-portfilio-backend-production.up.railway.app/',
        ENV: 'production'
    };
})();

// Log for debugging
console.log(`📍 Environment: ${CONFIG.ENV} | API: ${CONFIG.API_BASE}`);
