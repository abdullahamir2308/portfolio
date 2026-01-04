/**
 * Show loading placeholders while content loads
 */

class SkeletonLoader {
    static show(elementId, type = 'card') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const skeletons = {
            card: `
                <div class="skeleton-card">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-button"></div>
                </div>
            `,
            list: `
                <div class="skeleton-list">
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                </div>
            `,
            chart: `
                <div class="skeleton-chart">
                    <div class="skeleton-bar" style="height: 60%"></div>
                    <div class="skeleton-bar" style="height: 80%"></div>
                    <div class="skeleton-bar" style="height: 40%"></div>
                </div>
            `
        };
        
        element.innerHTML = skeletons[type] || skeletons.card;
    }
    
    static hide(elementId) {
        const element = document.getElementById(elementId);
        if (element && element.classList.contains('skeleton-container')) {
            element.innerHTML = '';
        }
    }
}