# Environment Configuration Guide

This guide explains how to configure environment variables for easy deployment of the forum application.

## Quick Setup for Development

The application is already configured to work with localhost by default. Just run:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
npm run dev
```

## Environment Files

### `.env` (Main environment file)
Contains the current active configuration. By default, it's set up for localhost development.

### `.env.development` (Development template)
Template for local development settings:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:8000`

### `.env.production` (Production template)
Template for production deployment. Copy this file and update the URLs for your production environment.

## Configuration Variables

| Variable | Description | Development | Production Example |
|----------|-------------|-------------|-------------------|
| `REACT_APP_FORUM_API_BASE_URL` | Backend API URL with `/api` path | `http://localhost:3001/api` | `https://api.yourdomain.com/api` |
| `REACT_APP_FORUM_BACKEND_URL` | Backend base URL | `http://localhost:3001` | `https://api.yourdomain.com` |
| `REACT_APP_FORUM_FRONTEND_URL` | Frontend URL (for CORS) | `http://localhost:8000` | `https://yourdomain.com` |
| `REACT_APP_FORUM_WS_URL` | WebSocket URL (if needed) | `ws://localhost:3001` | `wss://api.yourdomain.com` |

## Deployment Scenarios

### Scenario 1: Same Domain (Recommended)
Both frontend and backend on the same domain:
```env
REACT_APP_FORUM_API_BASE_URL=https://yourdomain.com/api
REACT_APP_FORUM_BACKEND_URL=https://yourdomain.com
REACT_APP_FORUM_FRONTEND_URL=https://yourdomain.com
```

### Scenario 2: Separate Domains
Frontend and backend on different domains:
```env
REACT_APP_FORUM_API_BASE_URL=https://api.yourdomain.com/api
REACT_APP_FORUM_BACKEND_URL=https://api.yourdomain.com
REACT_APP_FORUM_FRONTEND_URL=https://app.yourdomain.com
```

### Scenario 3: Subdomain Setup
Using subdomains:
```env
REACT_APP_FORUM_API_BASE_URL=https://backend.yourdomain.com/api
REACT_APP_FORUM_BACKEND_URL=https://backend.yourdomain.com
REACT_APP_FORUM_FRONTEND_URL=https://forum.yourdomain.com
```

## Backend Environment (backend/.env)

Make sure your backend `.env` file has the correct `FRONTEND_URL` for CORS:

```env
# Backend environment
NODE_ENV=production
PORT=3001
DATABASE_URL="your-database-url"
JWT_SECRET="your-secure-secret"
FRONTEND_URL="https://yourdomain.com"  # Must match your frontend URL
```

## Deployment Steps

1. **For Production:**
   - Copy `.env.production` to `.env`
   - Update all URLs to match your production environment
   - Update `backend/.env` with production database and CORS settings

2. **For Different Ports:**
   - Update the port numbers in the environment variables
   - Make sure backend and frontend ports don't conflict

3. **For Custom Domains:**
   - Replace `yourdomain.com` with your actual domain
   - Ensure SSL certificates are configured for HTTPS
   - Update DNS settings to point to your servers

## Testing Configuration

After deployment, test these endpoints:

- **Health Check:** `GET {BACKEND_URL}/health`
- **API Test:** `GET {API_BASE_URL}/health`
- **Frontend:** Navigate to `{FRONTEND_URL}`

## Common Issues

1. **CORS Errors:** Make sure `FRONTEND_URL` in backend matches your actual frontend URL
2. **API Not Found:** Verify `REACT_APP_FORUM_API_BASE_URL` includes `/api` at the end
3. **Mixed Content:** Use HTTPS for all URLs in production

## Environment Validation

The application will automatically use these environment variables. You can check the current configuration in the browser console or by testing API calls.
