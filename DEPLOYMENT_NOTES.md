# Deployment & Configuration Notes

## Pre-Deployment Checklist

### 1. Lemon Squeezy Configuration
- [ ] Update Pro plan product price to **$5/month** (was $9)
- [ ] Update Plus plan product price to **$19/month** (unchanged)
- [ ] Verify variant IDs in `.env.local` match your Lemon Squeezy setup:
  ```
  LEMON_SQUEEZY_PRO_VARIANT_ID=your_pro_plan_variant_id
  LEMON_SQUEEZY_PLUS_VARIANT_ID=your_plus_plan_variant_id
  ```

### 2. Environment Variables
Ensure `.env.local` contains:
```bash
# Required (unchanged)
SUPABASE_URL=
SUPABASE_ANON_KEY=
MISTRAL_API_KEY=
SERPER_API_KEY=
LEMON_SQUEEZY_WEBHOOK_SECRET=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_PLUS_VARIANT_ID=
NEXT_PUBLIC_APP_URL=

# Optional but recommended for better geolocation
IP_API_KEY=  # For ip-api.com Pro tier
```

### 3. Database
**No schema changes required.** All changes are code-based.

### 4. Testing Before Deployment
```bash
# 1. Test local build
npm run build
npm run dev

# 2. Test pricing page
- Visit http://localhost:3000/pricing
- Verify prices display (should be USD on localhost if US-based)
- Check currency code displays correctly

# 3. Test geolocation API
curl http://localhost:3000/api/user/geo-currency

# 4. Test with VPN (optional)
- Change IP location via VPN
- Visit pricing page again
- Verify currency changes

# 5. Test checkout flow
- Click upgrade button
- Verify currency is passed to checkout
```

---

## Deployment Steps

### Step 1: Push Code Changes
```bash
git add .
git commit -m "Update pricing: Pro $5/month, Plus 80 searches, auto currency conversion"
git push origin main
```

### Step 2: Update Lemon Squeezy
1. Log in to Lemon Squeezy dashboard
2. Find "Tera Pro Plan" product
3. Update price: **$5** (was $9)
4. Save changes

### Step 3: Deploy to Production
```bash
# If using Vercel
vercel --prod

# Or your preferred deployment method
```

### Step 4: Verify Deployment
1. Visit production pricing page: `https://yoursite.com/pricing`
2. Verify prices display correctly
3. Test geolocation API endpoint
4. Try checkout flow with different locations (via VPN)

---

## Cloudflare Configuration (Recommended)

If your app is behind Cloudflare, you get automatic geolocation headers:

```typescript
// Our code automatically checks for:
// - cf-ipcountry: Country code from Cloudflare
// - x-forwarded-for: Original client IP
// - x-real-ip: Client IP
```

**To enable on Cloudflare:**
1. Make sure "IP Geolocation" is enabled in Cloudflare
2. It's enabled by default - no action needed
3. Our API automatically reads `cf-ipcountry` header

---

## Exchange Rate Updates

### For Initial Deployment
Current rates in `lib/currency-converter.ts` are approximate. 

### For Production (Recommended)
Add automatic rate updates. Example using cron:

```typescript
// In your app initialization (e.g., app/layout.tsx)
import { updateExchangeRates } from '@/lib/currency-converter'

// Call once on startup
if (typeof window === 'undefined') { // Server-side only
  updateExchangeRates().catch(console.error)
}

// Or use a scheduled job (e.g., with a cron service)
// POST /api/admin/update-rates (protected route)
```

### Exchange Rate API Options
1. **ExchangeRate-API** (Recommended)
   - Free tier: 1,500 requests/month
   - URL: `https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD`
   - Sign up: https://www.exchangerate-api.com/

2. **Open Exchange Rates**
   - Free tier: 1,000 requests/month
   - URL: `https://openexchangerates.org/api/latest.json`
   - Sign up: https://openexchangerates.org/

3. **Your Payment Processor's Rates**
   - Lemon Squeezy may provide current rates
   - Check their documentation

---

## Monitoring & Analytics

### What to Monitor
1. **Currency Distribution**
   - Track which currencies users are seeing
   - Identify high-volume regions

2. **Conversion Rates**
   - Monitor checkout completion by currency
   - Track price differences (e.g., perceived affordability)

3. **Geolocation Accuracy**
   - Monitor failed geolocation attempts
   - Check if users seeing wrong currencies

4. **Exchange Rates**
   - Monitor rate staleness
   - Alert if rates become outdated

### Suggested Metrics
```typescript
// Log on pricing page view
analytics.track('pricing_viewed', {
  currency: 'NGN',
  country: 'NG',
  displayPrice: 7750,
  usdPrice: 5
})

// Log on checkout
analytics.track('checkout_initiated', {
  plan: 'pro',
  currency: 'NGN',
  convertedPrice: 7750
})

// Log conversions
analytics.track('subscription_created', {
  plan: 'pro',
  currency: 'NGN',
  country: 'NG'
})
```

---

## Troubleshooting

### Issue: Prices showing in wrong currency
**Solution:**
1. Check geolocation API: `GET /api/user/geo-currency`
2. Verify IP detection is working
3. Try different IP/VPN
4. Check browser console for errors

### Issue: Prices not converting
**Solution:**
1. Verify exchange rates are loaded in `currency-converter.ts`
2. Check network tab for `/api/user/geo-currency` request
3. Ensure currency code is valid (see EXCHANGE_RATES object)

### Issue: Geolocation API returns error
**Solution:**
1. Check IP is publicly routable (not localhost)
2. Verify ip-api.com is accessible
3. Check network connectivity
4. Review server logs for API errors

### Issue: Exchange rates outdated
**Solution:**
1. Manually call `updateExchangeRates()` 
2. Set up automatic daily updates
3. Update rates manually in code

### Issue: Checkout not receiving currency
**Solution:**
1. Check pricing page is passing currencyCode
2. Verify checkout API request includes currencyCode
3. Check Lemon Squeezy checkout URL parameters

---

## Rollback Plan

If issues arise after deployment:

### Quick Rollback
```bash
# 1. Revert last commit
git revert HEAD
git push origin main

# 2. Redeploy
vercel --prod
```

### Revert Pricing Changes Only
Keep geolocation but revert pricing:
```typescript
// In lib/plan-config.ts - revert prices
pro: { price: 9, ... }      // Back to $9
plus: { price: 19, ... }    // Stays $19
```

### Keep Currency but Not Pricing
This is partially possible - but not recommended as pricing and limits are interconnected.

---

## Performance Considerations

### Geolocation Lookup
- **Latency**: ~50-100ms per request (cached by browser)
- **Impact**: Minimal - happens once on pricing page load
- **Optimization**: Cloudflare cf-ipcountry headers eliminate API call

### Exchange Rates
- **Current**: Hardcoded (no external calls)
- **With Updates**: One API call per day/update
- **Cache**: Can cache for 24 hours to minimize API calls

### Recommendations
1. Use Cloudflare to avoid geolocation API calls
2. Cache exchange rates for 24 hours
3. Pre-compute converted prices if you have many currencies
4. Monitor API rate limits if using external services

---

## Security Considerations

### Geolocation Data
- IP address is extracted on server-side only
- No IP addresses stored in database
- Only country code and currency stored in frontend
- Compliant with GDPR (no personal data stored)

### Exchange Rates API
- No sensitive data in API calls
- Public rates (not user-specific)
- Consider using API keys if using rate-limited services

### Lemon Squeezy Integration
- Pricing information is public
- Webhooks remain secure with existing signatures
- No changes to payment security

---

## After Deployment

### Day 1
- [ ] Monitor error logs
- [ ] Check currency distribution
- [ ] Verify checkout conversions
- [ ] Test multiple locations

### Day 7
- [ ] Review conversion metrics
- [ ] Check for payment failures
- [ ] Validate exchange rates accuracy
- [ ] User feedback monitoring

### Week 2
- [ ] Analyze regional pricing strategy
- [ ] Consider additional currencies
- [ ] Plan for dynamic pricing (if needed)
- [ ] Set up automated rate updates

### Month 1
- [ ] Full performance analysis
- [ ] Regional expansion strategy
- [ ] Local payment method evaluation
- [ ] Pricing optimization based on data

---

## Configuration by Deployment Platform

### Vercel
```bash
# Add environment variables in Vercel dashboard
NEXT_PUBLIC_APP_URL=https://yourdomain.com
LEMON_SQUEEZY_PRO_VARIANT_ID=xxx
LEMON_SQUEEZY_PLUS_VARIANT_ID=xxx
# ... etc
```

### Docker
```dockerfile
ENV NEXT_PUBLIC_APP_URL=https://yourdomain.com
# Build and deploy normally
```

### AWS Amplify
```bash
# Add environment variables in console
# Deploy as normal Next.js app
```

### DigitalOcean App Platform
```yaml
envs:
  - key: NEXT_PUBLIC_APP_URL
    value: https://yourdomain.com
```

---

## Support & Questions

- **Pricing Logic**: `lib/plan-config.ts`
- **Currency Conversion**: `lib/currency-converter.ts`
- **Geolocation API**: `app/api/user/geo-currency/route.ts`
- **Checkout Integration**: `app/api/checkout/create-session/route.ts`
- **Documentation**: `PRICING_UPDATES.md` and `QUICK_PRICING_CHECKLIST.md`

---

**Ready for deployment!** ✅
