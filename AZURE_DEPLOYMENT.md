# Azure Deployment Guide

## Backend (Azure App Service)
1. Create App Service (Linux, Python 3.11)
2. Enable "Continuous Deployment" from GitHub
3. Configure startup command: `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Add environment variables in App Settings

## Frontend (Azure Static Web Apps)
1. Create Static Web App resource
2. Connect GitHub repository
3. Build configuration:
   - App location: `/frontend`
   - Output location: `.`
4. Add API backend URL as environment variable

## Database (Optional)
- Use Azure Cosmos DB or PostgreSQL for persistent storage
- Will replace JSON files

## Cost Management
- Free tier available for App Service (F1) and Static Web Apps (free)
- Set budget alerts ($20/month)