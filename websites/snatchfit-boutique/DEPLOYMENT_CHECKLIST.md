# SnatchFit Boutique - Deployment Checklist

## Pre-Deployment (Before Going Live)

### Code Quality
- [ ] All pages tested locally
- [ ] No console errors
- [ ] No broken links
- [ ] Responsive design verified on mobile
- [ ] All forms working correctly
- [ ] Payment flow tested with Stripe test cards
- [ ] Admin panel fully functional

### Security
- [ ] Changed admin password in `.env`
- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] No sensitive data in code
- [ ] All API routes have proper validation
- [ ] CORS properly configured
- [ ] Environment variables not committed to git
- [ ] `.env.local` added to `.gitignore`

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (or 0.0.0.0/0 for testing)
- [ ] Connection string verified
- [ ] Database name is correct
- [ ] Backup strategy planned

### Stripe
- [ ] Stripe account created
- [ ] Test API keys obtained
- [ ] Publishable key is public (pk_test_)
- [ ] Secret key is private (sk_test_)
- [ ] Webhook endpoint configured (for production)
- [ ] Test payment successful

### Performance
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] No unused dependencies
- [ ] Build completes without warnings
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 80

### Documentation
- [ ] README.md complete
- [ ] SETUP_GUIDE.md complete
- [ ] QUICK_START.md complete
- [ ] Code comments added
- [ ] API documentation complete

## Deployment to Vercel

### Step 1: Prepare Repository
```bash
# Ensure all changes committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Authorize Vercel to access repositories

### Step 3: Import Project
- [ ] Click "New Project"
- [ ] Select your repository
- [ ] Click "Import"

### Step 4: Configure Environment Variables
In Vercel dashboard, add:
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Strong random string
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `NEXTAUTH_SECRET` - NextAuth secret
- [ ] `NEXTAUTH_URL` - Your Vercel domain
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel domain
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL` - Admin email
- [ ] `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin password
- [ ] `NODE_ENV` - Set to `production`

### Step 5: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Verify deployment successful

### Step 6: Test Production
- [ ] Visit your Vercel domain
- [ ] Test homepage loads
- [ ] Test shop page
- [ ] Test product page
- [ ] Test cart functionality
- [ ] Test checkout with Stripe test card
- [ ] Test admin login
- [ ] Check console for errors

## Post-Deployment

### Monitoring
- [ ] Set up error tracking (Sentry optional)
- [ ] Monitor Vercel analytics
- [ ] Check MongoDB Atlas metrics
- [ ] Monitor Stripe transactions
- [ ] Set up email alerts

### Maintenance
- [ ] Regular database backups
- [ ] Monitor server logs
- [ ] Update dependencies monthly
- [ ] Security patches applied
- [ ] Performance optimizations

### Customer Support
- [ ] Contact page working
- [ ] Email notifications set up
- [ ] Support email monitored
- [ ] FAQ page created
- [ ] Help documentation available

## Production Checklist

### Before First Customer
- [ ] SSL certificate active (Vercel auto)
- [ ] Domain configured (if custom domain)
- [ ] Email notifications working
- [ ] Order confirmation emails sent
- [ ] Admin notifications working
- [ ] Payment receipts sent
- [ ] Shipping information available

### Ongoing
- [ ] Daily order monitoring
- [ ] Weekly sales reports
- [ ] Monthly performance review
- [ ] Quarterly security audit
- [ ] Annual infrastructure review

## Troubleshooting Deployment

### Build Fails
```bash
# Check build locally
npm run build

# Check for errors
npm run lint

# Clear cache
rm -rf .next
npm run build
```

### Environment Variables Not Working
- [ ] Verify variables in Vercel dashboard
- [ ] Check variable names match code
- [ ] Redeploy after adding variables
- [ ] Check for typos

### Database Connection Error
- [ ] Verify MongoDB URI is correct
- [ ] Check IP whitelist in MongoDB Atlas
- [ ] Verify database exists
- [ ] Test connection locally first

### Stripe Not Working
- [ ] Verify API keys in Vercel
- [ ] Check Stripe account is active
- [ ] Verify test mode enabled
- [ ] Check webhook configuration

### Performance Issues
- [ ] Check Vercel analytics
- [ ] Optimize images
- [ ] Enable caching
- [ ] Reduce bundle size
- [ ] Use CDN for static assets

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Vercel will auto-redeploy
```

## Monitoring URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Your App**: https://your-domain.vercel.app

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Stripe Docs: https://stripe.com/docs

## Final Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Team trained
- [ ] Support ready
- [ ] Monitoring active
- [ ] Backup strategy in place
- [ ] Ready for customers!

## Go Live!

Once all items checked:

1. Announce launch
2. Monitor closely first 24 hours
3. Be ready to support customers
4. Celebrate! 🎉

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Notes**: _______________

---

Good luck! 🚀
