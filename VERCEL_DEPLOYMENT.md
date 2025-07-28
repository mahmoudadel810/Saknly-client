# Vercel Deployment Guide for Saknly

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Connect your repository
3. **Environment Variables**: Set up your production environment variables

## Deployment Steps

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a Next.js project

### 2. Configure Environment Variables
In your Vercel project settings, add these environment variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://saknly-server-9air.vercel.app/api/saknly/v1

# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Domain Configuration
1. Go to your project settings
2. Add your custom domain (if any)
3. Configure DNS settings as instructed

## Important Notes

### API Routes
- All API routes are automatically deployed to `/api/*`
- CORS headers are configured in `vercel.json`
- Function timeout is set to 30 seconds

### Middleware
- Middleware runs on all routes except static assets
- Admin routes are protected with JWT authentication
- Public routes are whitelisted

### Performance Optimizations
- Images are optimized with Next.js Image component
- CSS is optimized and minified
- Bundle splitting is configured for better caching

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Ensure all dependencies are in `package.json`
   - Review build logs in Vercel dashboard

2. **API Route Issues**
   - Verify backend URL is accessible
   - Check CORS configuration
   - Ensure proper error handling

3. **Authentication Issues**
   - Verify JWT tokens are valid
   - Check cookie settings
   - Ensure proper redirect URLs

### Debugging
- Use Vercel's function logs for API debugging
- Check browser console for client-side issues
- Review network tab for failed requests

## Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Monitor Core Web Vitals
- Track user interactions

### Error Tracking
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API response times
- Track build success rates

## Security

### Headers
Security headers are configured in `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Environment Variables
- Never commit sensitive data to Git
- Use Vercel's environment variable system
- Rotate secrets regularly

## Support

For issues specific to Vercel deployment:
1. Check Vercel documentation
2. Review build logs
3. Contact Vercel support if needed

For application-specific issues:
1. Check the application logs
2. Review the codebase
3. Test locally first 