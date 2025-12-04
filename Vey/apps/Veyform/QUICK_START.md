# Veyform Admin Dashboard - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you get the Veyform admin dashboard up and running quickly.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation Steps

### 1. Navigate to the Veyform Directory

```bash
cd Vey/apps/Veyform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Tailwind CSS 3
- TypeScript 5
- And other dependencies

**Installation time**: ~30 seconds

### 3. Set Up Environment Variables (Optional)

```bash
cp .env.example .env
```

Then edit `.env` to configure your settings:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_VEYBOOK_API_URL=https://api.veybook.com

# Authentication (optional for development)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database (optional for development)
DATABASE_URL=postgresql://user:password@localhost:5432/veyform
```

**Note**: Environment variables are optional for development. The dashboard will work with placeholder data without them.

### 4. Start Development Server

```bash
npm run dev
```

The dashboard will be available at: **http://localhost:3000**

**Startup time**: ~2-3 seconds

## 🎯 What You'll See

Once started, you'll have access to:

### Dashboard Pages

1. **Overview** - `/dashboard`
   - View API request statistics
   - Monitor active integrations
   - See recent activity

2. **Integration Builder** - `/dashboard/integration-builder`
   - Configure integration settings
   - Generate integration code
   - Test your configuration

3. **Connect** - `/dashboard/connect`
   - Connect to Shopify, WooCommerce, Magento
   - Manage platform connections
   - View integration status

4. **API Keys** - `/dashboard/api-keys`
   - Create new API keys
   - View and manage existing keys
   - Copy keys for use in applications

5. **Webhooks** - `/dashboard/webhooks`
   - Set up webhook endpoints
   - Subscribe to events
   - Test webhook delivery

6. **Monitor** - `/dashboard/monitor`
   - View API metrics
   - Track response times
   - Monitor error rates

7. **Live Logs** - `/dashboard/live-logs`
   - Real-time event stream
   - Filter by log level
   - Export logs

8. **Settings** - `/dashboard/setting`
   - Configure general settings
   - Manage security options
   - Set up notifications

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run type checking
npm run type-check

# Run linter
npm run lint

# Run tests (when available)
npm run test

# Run E2E tests (when available)
npm run test:e2e
```

## 📝 First Steps After Installation

1. **Explore the Dashboard**
   - Navigate to http://localhost:3000
   - Browse through all 8 dashboard pages
   - Familiarize yourself with the interface

2. **Review the Documentation**
   - Read `README.md` for comprehensive information
   - Check `DASHBOARD.md` for detailed feature descriptions
   - Review `IMPLEMENTATION_STATUS.md` for current status

3. **Configure Your Integration**
   - Go to Integration Builder
   - Select your platform type
   - Generate integration code
   - Copy code to your application

4. **Set Up API Keys**
   - Navigate to API Keys page
   - Create a new API key
   - Copy the key for use in your app
   - Store it securely in environment variables

5. **Configure Webhooks (Optional)**
   - Go to Webhooks page
   - Create a new webhook endpoint
   - Subscribe to desired events
   - Test webhook delivery

## 🎨 Customization

### Changing the Port

If port 3000 is already in use:

```bash
# Option 1: Next.js will automatically use the next available port
npm run dev

# Option 2: Specify a custom port
PORT=3001 npm run dev
```

### Modifying Styles

The dashboard uses Tailwind CSS. To customize:

1. Edit `tailwind.config.js` for theme changes
2. Modify `app/globals.css` for global styles
3. Update component styles directly in the `.tsx` files

### Adding Features

To add new dashboard pages:

1. Create a new directory in `app/dashboard/`
2. Add a `page.tsx` file
3. Update `components/Sidebar.tsx` to add navigation
4. The page will be automatically routed

## 🐛 Troubleshooting

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**: Next.js will automatically try port 3001. Or specify a custom port:
```bash
PORT=3002 npm run dev
```

### Dependencies Installation Fails

**Problem**: `npm install` fails

**Solution**: 
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Build Errors

**Problem**: `npm run build` fails

**Solution**:
```bash
# Run type checking to identify issues
npm run type-check

# Run linter to check for code issues
npm run lint

# Check the error message for specific issues
```

### Page Not Loading

**Problem**: Dashboard page shows errors

**Solution**:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Clear Next.js cache: `rm -rf .next`
4. Rebuild: `npm run build`

## 🔐 Security Notes

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use `.env.local` for sensitive data
3. **Production**: Always use HTTPS in production
4. **Secrets**: Rotate secrets regularly

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check the `IMPLEMENTATION_STATUS.md` file
2. Review the `DASHBOARD.md` documentation
3. Consult the main repository README
4. Check existing GitHub issues
5. Create a new issue with details

## ✅ Success Checklist

- [ ] Dependencies installed successfully
- [ ] Development server starts without errors
- [ ] Dashboard loads at http://localhost:3000
- [ ] All 8 pages are accessible
- [ ] Navigation sidebar works correctly
- [ ] No console errors in browser

## 🎉 You're Ready!

Once the development server is running, you're ready to start using the Veyform admin dashboard. Explore the features, configure your integration, and start managing your address form system.

---

**Total Setup Time**: ~5 minutes
**Difficulty**: Easy
**Next Steps**: Explore the dashboard and configure your first integration

Happy coding! 🚀
