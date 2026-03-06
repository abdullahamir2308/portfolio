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
    
    // // Vercel production
    // if (hostname.includes('vercel.app')) {
    //     return {
    //         API_BASE: 'https://ai-portfolio-backend-production.up.railway.app', // your Railway backend
    //         ENV: 'production'
    //     };
    // }
    
    // Azure Static Web Apps
    if (hostname.includes('azurestaticapps.net')) {
        return {
            API_BASE: 'https://ai-portfolio-dve0edghh4aqfue2.southeastasia-01.azurewebsites.net', // replace with your actual Azure backend URL
            ENV: 'production'
        };
    }
    
    // Custom domain (if you have one)
    if (hostname === 'yourdomain.com' || hostname === 'www.yourdomain.com') {
        return {
            API_BASE: 'https://your-backend.azurewebsites.net', // also update here if using Azure
            ENV: 'production'
        };
    }
    
    // Fallback to production
    console.warn('⚠️ Unknown environment:', hostname, '- Using production API');
    return {
        API_BASE: 'https://ai-portfolio-dve0edghh4aqfue2.southeastasia-01.azurewebsites.net', // default to Azure after migration
        ENV: 'production'
    };
})();

// Log for debugging
console.log(`📍 Environment: ${CONFIG.ENV} | API: ${CONFIG.API_BASE}`);