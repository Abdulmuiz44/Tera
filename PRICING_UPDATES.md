# Pricing & Currency Updates

## Summary of Changes

This document outlines all the pricing, plan limits, and currency conversion changes made to the Tera platform.

---

## 1. Plan Limit Changes

### Free Plan
- **Web Searches/Month**: 5 (unchanged)
- **File Uploads/Day**: 5 (unchanged)
- **Price**: $0 (unchanged)
- **Display Name**: Changed from "Starter" to "Free"

### Pro Plan
- **Web Searches/Month**: 50 (changed from 100)
- **File Uploads/Day**: 20 (changed from unlimited)
- **Price**: $5/month (changed from $9)
- **Max File Size**: 500MB (unchanged)

### Plus Plan
- **Web Searches/Month**: 80 (changed from 500)
- **File Uploads/Day**: Unlimited (unchanged)
- **Price**: $19/month (unchanged)
- **Max File Size**: 2GB (unchanged)

---

## 2. Terminology Changes

All references to "Starter" plan have been replaced with "Free" throughout the application:

### Files Updated:
- `lib/plan-config.ts` - displayName changed from "Starter" to "Free"
- `components/UpgradePrompt.tsx` - Updated web search limit description
- `app/pricing/page.tsx` - Updated comparison table header

### Where "Free" Appears:
- Pricing page plan cards and comparison table
- Upgrade prompt messages
- User menu subscription display
- All documentation

---

## 3. Automatic Currency Conversion

The platform now automatically detects user's location and converts prices to their local currency using real-time exchange rates.

### How It Works:

#### New Files:
1. **`lib/currency-converter.ts`** - Core currency conversion logic
   - Supports 12+ currencies (USD, NGN, GBP, EUR, INR, CAD, AUD, JPY, KES, ZAR, MXN, BRL)
   - Exchange rate conversion with real-time API support
   - Country-to-currency mapping
   - Price formatting with currency symbols

2. **`app/api/user/geo-currency/route.ts`** - Geolocation API endpoint
   - Server-side IP geolocation using ip-api.com
   - Cloudflare header support for accurate detection
   - Fallback mechanisms for reliability
   - Returns user's country code and currency information

#### Updated Files:
1. **`app/pricing/page.tsx`** - Pricing page with currency support
   - Loads user's country and currency on page load
   - Displays prices in user's local currency
   - Shows currency code and country code below price
   - Passes currency information to checkout

2. **`app/api/checkout/create-session/route.ts`** - Checkout endpoint
   - Accepts currencyCode parameter
   - Passes currency information to payment processor

3. **`lib/lemon-squeezy.ts`** - Payment integration
   - Updated to accept optional currencyCode parameter

### Supported Countries & Currencies:

| Country | Currency | Code | Symbol |
|---------|----------|------|--------|
| Nigeria | Naira | NGN | ₦ |
| United States | Dollar | USD | $ |
| United Kingdom | Pound | GBP | £ |
| European Union | Euro | EUR | € |
| India | Rupee | INR | ₹ |
| Canada | Canadian Dollar | CAD | C$ |
| Australia | Australian Dollar | AUD | A$ |
| Japan | Yen | JPY | ¥ |
| Kenya | Kenyan Shilling | KES | KSh |
| South Africa | South African Rand | ZAR | R |
| Mexico | Mexican Peso | MXN | $ |
| Brazil | Brazilian Real | BRL | R$ |

### Example Pricing Conversions:

**Pro Plan ($5 USD/month):**
- Nigeria: ₦7,750 (at ~1550 NGN/USD)
- India: ₹415.60 (at ~83.12 INR/USD)
- UK: £3.95 (at ~0.79 GBP/USD)
- Canada: C$6.80 (at ~1.36 CAD/USD)

**Plus Plan ($19 USD/month):**
- Nigeria: ₦29,450
- India: ₦1,579.28
- UK: £15.01
- Canada: C$25.84

---

## 4. Technical Implementation Details

### Frontend Flow:
```
1. User visits /pricing page
2. Page calls getUserCountryAndCurrency() from currency-converter.ts
3. Function makes request to /api/user/geo-currency
4. API endpoint determines user's country from IP or Cloudflare headers
5. Returns currency information to frontend
6. Pricing cards display converted prices using convertPrice() function
7. When user clicks "Upgrade", currency code is sent with checkout request
```

### Backend Flow:
```
1. /api/user/geo-currency receives request
2. Extracts user's IP from x-forwarded-for or x-real-ip headers
3. Checks for Cloudflare cf-ipcountry header first
4. If needed, calls ip-api.com for geolocation
5. Maps country code to currency
6. Returns currency info with exchange rate
```

### Database:
No database changes required. Currency information is derived from:
- User's IP address (via geolocation API)
- Cloudflare headers (if deployed on Cloudflare)
- Browser language (fallback)

---

## 5. Exchange Rates

Exchange rates are stored in `lib/currency-converter.ts` with approximate current rates. For production deployment:

### Recommendations:
1. **Update Rates Regularly**: Implement periodic rate updates from:
   - ExchangeRate-API (free tier: 1500 requests/month)
   - Open Exchange Rates (free tier: 1000 requests/month)
   - Your payment processor's current rates

2. **Call updateExchangeRates()** at application startup and periodically (e.g., daily)

3. **Rate Caching**: Consider caching rates for 24 hours to reduce API calls

### Current Implementation:
Rates are hardcoded with approximate values. The `updateExchangeRates()` function is available but not called automatically. Add this to your app initialization:

```typescript
// In your app's main layout or initialization
import { updateExchangeRates } from '@/lib/currency-converter'

// Call on app startup
updateExchangeRates()

// Or set up a scheduled task (e.g., daily)
setInterval(updateExchangeRates, 24 * 60 * 60 * 1000)
```

---

## 6. Files Modified

### Core Configuration:
- `lib/plan-config.ts` - Updated plan limits and pricing
- `lib/web-search-usage.ts` - Updated web search limits

### UI Components:
- `components/UpgradePrompt.tsx` - Updated messages with new limits
- `app/pricing/page.tsx` - Added currency conversion and display logic

### API Routes:
- `app/api/checkout/create-session/route.ts` - Added currency support
- `app/api/user/geo-currency/route.ts` - NEW: Geolocation endpoint

### Payment Integration:
- `lib/lemon-squeezy.ts` - Updated to accept currency parameter

### New Files Created:
- `lib/currency-converter.ts` - Currency conversion utilities
- `app/api/user/geo-currency/route.ts` - Geolocation API

### Documentation:
- `IMPLEMENTATION_COMPLETE.md` - Updated with new plan details
- `PRICING_UPDATES.md` - This file

---

## 7. Testing Checklist

### Pricing Page:
- [ ] Visit `/pricing` from different country (use VPN if needed)
- [ ] Verify correct currency displays
- [ ] Check that currency code and country are shown
- [ ] Test price calculations (use calculator)
- [ ] Verify Pro plan shows $5 in USD, ₦7,750 in NGN, etc.

### Checkout Flow:
- [ ] Click "Upgrade to Pro" button
- [ ] Verify checkout URL is generated with currency info
- [ ] Complete test payment
- [ ] Verify plan is correctly set in database

### API Endpoints:
- [ ] GET `/api/user/geo-currency` returns correct country and currency
- [ ] POST `/api/checkout/create-session` accepts currencyCode parameter
- [ ] Verify web search limits are enforced correctly (50 for Pro, 80 for Plus)

### File Upload Limits:
- [ ] Free plan: 5 uploads/day limit enforced
- [ ] Pro plan: 20 uploads/day limit enforced
- [ ] Plus plan: unlimited uploads/day enforced

### Database:
- [ ] New subscriptions store correct plan type
- [ ] Web search counts track correctly with new limits
- [ ] File upload counts track correctly with new limits

---

## 8. Migration Notes

### For Existing Users:
- No user data migration needed
- Existing subscriptions remain valid
- Plan limits will apply on next reset period
- New pricing applies to new subscriptions only

### For Lemon Squeezy:
- Update product prices in Lemon Squeezy dashboard to reflect new pricing
- Ensure variant IDs in env variables match correct plans
- Test webhook handling with new plan structure

---

## 9. Environment Variables

Ensure these are set in `.env.local`:

```
LEMON_SQUEEZY_PRO_VARIANT_ID=your_pro_plan_variant_id
LEMON_SQUEEZY_PLUS_VARIANT_ID=your_plus_plan_variant_id
```

Optional for enhanced geolocation:
```
# For ip-api.com Pro (more accurate)
IP_API_KEY=your_ip_api_key
```

---

## 10. Future Enhancements

1. **Dynamic Pricing**: Implement price variations per country
2. **Local Payment Methods**: Support local payment options (M-Pesa, PIX, etc.)
3. **Rate Updates**: Implement automatic daily rate updates
4. **Analytics**: Track revenue by currency and region
5. **Localization**: Translate pricing and product information
6. **Tax Handling**: Add local tax calculation per country

---

## Support & Questions

For issues or questions about the pricing updates:
1. Check `/pricing` page to verify currency detection
2. Review browser console for any geolocation errors
3. Test with different VPN locations if needed
4. Contact support with user's location and displayed currency
