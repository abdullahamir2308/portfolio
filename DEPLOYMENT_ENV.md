# Production Environment Variables

## Railway (Backend)
- `OPENAI_API_KEY` - required
- `AI_CONTEXT` - required (your short bio)
- `GITHUB_TOKEN` - optional (for real data)
- `GITHUB_USERNAME` - optional
- `SENDGRID_API_KEY` - optional (for real email)
- `EMAIL_FROM` - optional
- `EMAIL_TO` - optional
- `LINKEDIN_TOKEN` - optional (for job search)
- `INDEED_PUBLISHER_ID` - optional
- `RAILWAY_PUBLIC_DOMAIN` - auto-set by Railway, used for CORS
- `ENVIRONMENT` - set to "production" on Railway

## Vercel (Frontend)
- `VITE_API_URL` - Railway backend URL (e.g., https://your-app-name-production.up.railway.app)

## Azure (Future)
- Will use App Service / Static Web Apps
- Environment variables same as above