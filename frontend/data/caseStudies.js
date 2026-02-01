/**
 * PROJECT CASE STUDIES - Day 11
 * Professional showcase of portfolio projects
 */

const CASE_STUDIES = {
    aiPortfolio: {
        id: 'ai-portfolio',
        title: 'AI-Powered Portfolio System',
        tagline: 'Intelligent portfolio with autonomous AI agents and automation',
        status: 'Live',
        timeline: '2 weeks',
        technologies: ['FastAPI', 'OpenAI API', 'JavaScript', 'Bootstrap 5', 'n8n'],
        
        overview: 'A dynamic portfolio that showcases AI integration skills through interactive agents, automation workflows, and real-time data processing.',
        
        features: [
            'AI Chat Assistant with conversation memory and semantic search',
            'Autonomous AI Agent with 5+ specialized tools',
            'n8n automation workflows for scheduled tasks',
            'GitHub API integration for real-time coding analytics',
            'Email notification system with professional templates',
            'Mobile-first responsive design with dark mode support'
        ],
        
        challenges: [
            'Integrating multiple AI models while managing token costs',
            'Implementing conversation memory without external databases',
            'Creating user-friendly interfaces for complex AI operations'
        ],
        
        solutions: [
            'Used OpenAI GPT-4o-mini for cost-effective intelligence',
            'Implemented dual memory system (recent + semantic) with embeddings',
            'Created intuitive dashboards with progressive disclosure'
        ],
        
        metrics: {
            'Initial Load Time': '1.8s',
            'API Response Time': '<200ms',
            'User Engagement': '+40% with AI features',
            'Code Quality': '95% Lighthouse score'
        },
        
        githubUrl: 'https://github.com/yourusername/ai-portfolio',
        liveUrl: 'https://your-portfolio.vercel.app'
    },
    
    aiAgentSystem: {
        id: 'ai-agent',
        title: 'AI Agent Framework',
        tagline: 'Modular agent system with tool execution and planning',
        status: 'Production',
        timeline: '1 week',
        technologies: ['Python', 'OpenAI API', 'FastAPI', 'JSON'],
        
        overview: 'A reusable AI agent framework that can plan, execute, and learn from tasks using specialized tools.',
        
        features: [
            'Tool abstraction pattern for extensible functionality',
            'Autonomous task planning with GPT-4o-mini',
            'Execution memory and feedback loops',
            'Error handling with graceful fallbacks'
        ],
        
        technicalDetails: [
            'Architecture: Perceive → Plan → Act → Learn',
            'Tools: Summarize, Analyze Code, Generate Docs, Track Learning',
            'Memory: Conversation history with semantic embeddings'
        ]
    },
    
    automationDashboard: {
        id: 'automation',
        title: 'Workflow Automation Dashboard',
        tagline: 'Visual interface for AI-powered automation management',
        status: 'Live',
        timeline: '3 days',
        technologies: ['JavaScript', 'n8n', 'FastAPI', 'Chart.js'],
        
        overview: 'Dashboard for managing automated AI tasks, scheduling workflows, and monitoring execution results.',
        
        features: [
            'n8n workflow integration with webhook triggers',
            'Task scheduling with cron expressions',
            'Real-time activity monitoring',
            'Success rate analytics and reporting'
        ]
    }
};

export default CASE_STUDIES;