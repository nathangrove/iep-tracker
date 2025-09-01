# GitHub Pages Deployment Guide

## 🚀 Quick Setup Steps

### 1. Repository Setup
1. Create a new GitHub repository (or use an existing one)
2. Upload your code to the repository
3. Make sure you're on the `main` branch

### 2. Update Configuration
Update these files with your actual repository information:

**package.json** - Change the homepage URL:
```json
"homepage": "https://nathangrove.github.io/iep-tracker"
```

**README.md** - Update the demo link:
```markdown
Visit the live application: [https://nathangrove.github.io/iep-tracker](https://nathangrove.github.io/iep-tracker)
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 Web Application credentials
5. Add your GitHub Pages domain to **Authorized JavaScript origins**:
   - `https://nathangrove.github.io`
6. Update `GOOGLE_CLIENT_ID` in `src/App.tsx`

### 4. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically run on your next push

### 5. Deploy
Push your changes to the `main` branch:
```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
- Install dependencies
- Build the project
- Deploy to GitHub Pages

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
npm run deploy
```

This will build and push directly to the `gh-pages` branch.

## 🌐 Domain Recommendations

For a professional deployment, consider these domains:
- `ieptracker.org` (Recommended)
- `myieptracker.com`
- `specialedtracker.org`

You can configure a custom domain in GitHub Pages settings.

## ✅ Verification Steps

After deployment:

1. **Check the deployment**: Visit your GitHub Pages URL
2. **Test Google Login**: Try logging in with an organizational Google account
3. **Verify Data Storage**: Create a test student and goal
4. **Test Reports**: Generate and print a report
5. **Check Mobile**: Ensure mobile responsiveness

## 🔒 Security Considerations

- **Domain Verification**: Add your domain to Google OAuth authorized origins
- **HTTPS Only**: GitHub Pages provides HTTPS by default
- **Organizational Accounts**: Restrict to school district Google accounts only

## 🐛 Troubleshooting

### Build Errors
- Check that all dependencies are installed: `npm install`
- Verify Node.js version (16+ required)
- Check for TypeScript errors: `npm run build`

### OAuth Errors
- Verify Google Client ID is correct
- Ensure domain is added to authorized origins
- Check that Google Drive API is enabled

### Deployment Issues
- Ensure you're on the `main` branch
- Check GitHub Actions tab for error logs
- Verify repository settings for Pages

## 📱 Mobile Compatibility

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Print media

## 🔄 Updates and Maintenance

To update the deployed app:
1. Make changes to your code
2. Push to the `main` branch
3. GitHub Actions will automatically redeploy

## 📊 Analytics (Optional)

To add Google Analytics:
1. Create a Google Analytics property
2. Add the tracking code to `public/index.html`
3. Rebuild and deploy

---

**Need Help?** Create an issue in the GitHub repository with:
- Your error message
- Browser and OS information
- Steps to reproduce the problem
