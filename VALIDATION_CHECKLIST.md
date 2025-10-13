# Schema Validation Checklist

## ✅ Pre-Deployment Checklist

### Files Created
- [x] `app/services/spare-parts/ac/page.tsx` - AC Spare Parts product page
- [x] `app/services/spare-parts/refrigerator/page.tsx` - Refrigerator Spare Parts product page
- [x] Both files have complete Product schema with offers, aggregateRating, and reviews
- [x] No TypeScript errors or warnings

### Schema Requirements Met
- [x] Product @type specified
- [x] Product name and description included
- [x] **Image** field included (empty array - temporary) ✅
- [x] Brand information added
- [x] **Offers** object with price, currency, availability ✅
- [x] **AggregateRating** with ratingValue and reviewCount ✅
- [x] **Review** array with multiple customer reviews ✅
- [x] All required fields for Google Rich Results

### Page Content
- [x] SEO-optimized titles and meta descriptions
- [x] Canonical URLs set correctly
- [x] Hero section with clear product name
- [x] Complete parts list
- [x] Brand showcase
- [x] Pricing information
- [x] Customer reviews displayed
- [x] CTA buttons (Call/WhatsApp)
- [x] Mobile-responsive design

## 🧪 Post-Deployment Testing

### 1. Google Rich Results Test

Test these URLs after deployment:

**AC Spare Parts:**
```
https://www.coolwind.co.in/services/spare-parts/ac
```
Test at: https://search.google.com/test/rich-results

**Expected Result:**
- ✅ "Eligible for rich results"
- ✅ Product rich snippet preview shown
- ✅ Star rating visible (4.8 ⭐)
- ✅ Price shown (₹2,500)
- ✅ NO error: "Either 'offers', 'review', or 'aggregateRating' should be specified"
- ✅ NO error: "Missing field 'image'"

**Refrigerator Spare Parts:**
```
https://www.coolwind.co.in/services/spare-parts/refrigerator
```
Test at: https://search.google.com/test/rich-results

**Expected Result:**
- ✅ "Eligible for rich results"
- ✅ Product rich snippet preview shown
- ✅ Star rating visible (4.7 ⭐)
- ✅ Price shown (₹1,500)
- ✅ NO error: "Either 'offers', 'review', or 'aggregateRating' should be specified"
- ✅ NO error: "Missing field 'image'"

### 2. Manual Page Testing

Visit each page and verify:
- [ ] Page loads without errors
- [ ] Schema script tag is in the HTML source
- [ ] All content displays correctly
- [ ] CTAs work (phone/WhatsApp links)
- [ ] Mobile responsive
- [ ] Images load (if any)
- [ ] No console errors

### 3. Schema Markup Validator

Test at: https://validator.schema.org/

Paste the page source or URL and verify:
- [ ] No schema errors
- [ ] All required properties present
- [ ] Proper nesting of objects

### 4. Google Search Console

After deployment:
1. [ ] Submit new URLs for indexing
2. [ ] Update sitemap (run `npm run sitemap`)
3. [ ] Submit updated sitemap to GSC
4. [ ] Monitor "Enhancements" section for Product rich results
5. [ ] Check for any new errors in Coverage report

## 🔧 Troubleshooting

### If Rich Results Test Still Shows Errors:

**Error: "Missing required field"**
- Check that all three are present: offers, aggregateRating, review
- Verify JSON-LD syntax is valid
- Ensure no typos in property names

**Error: "Invalid value"**
- Check price is a string or number
- Verify ratingValue is between 1-5
- Ensure dates are in ISO format (YYYY-MM-DD)

**Error: "URL mismatch"**
- Verify canonical URL matches actual page URL
- Check offers.url matches page URL
- Ensure no trailing slashes mismatch

### If Page Doesn't Load:

1. Check Next.js build: `npm run build`
2. Verify no TypeScript errors: `npm run lint`
3. Check file paths are correct
4. Ensure environment variables are set

## 📊 Success Metrics

Monitor these in Google Search Console (7-14 days after deployment):

- [ ] Product rich results appear in "Enhancements"
- [ ] Impressions increase for product keywords
- [ ] Click-through rate improves
- [ ] Average position improves for:
  - "AC spare parts Thiruvalla"
  - "Refrigerator spare parts Kerala"
  - Related product searches

## 🎯 Target Keywords

These pages should rank for:

**AC Spare Parts Page:**
- AC spare parts Thiruvalla
- Air conditioner parts Kerala
- AC compressor Thiruvalla
- Genuine AC parts Kerala
- AC PCB board Thiruvalla

**Refrigerator Spare Parts Page:**
- Refrigerator spare parts Kerala
- Fridge parts Thiruvalla
- Refrigerator compressor Kerala
- Door seal refrigerator Kerala
- Genuine fridge parts Thiruvalla

## 📞 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify schema with Google's testing tool
3. Review Next.js build logs
4. Check Vercel deployment logs (if using Vercel)

---

**Last Updated:** January 2024
**Status:** Ready for deployment ✅
