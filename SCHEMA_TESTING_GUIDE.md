# Schema Testing & Validation Guide

## Quick Start

### 1. Validate Implementation
```bash
node scripts/validate-schema.js
```

### 2. Build Project
```bash
npm run build
```

### 3. Test Locally
```bash
npm run dev
```
Visit: http://localhost:3000/services

## Testing URLs

After deployment, test these URLs with Google Rich Results Test:

### Main Services Page
**URL:** https://www.coolwind.co.in/services
**Expected Schema:** 4 Service schemas (AC, Refrigerator, Spare Parts, Electronics)

### AC Repair Service
**URL:** https://www.coolwind.co.in/services/ac-repair
**Expected Schema:** Service
- Rating: 4.8/5 (87 reviews)
- Price Range: ₹500-₹5000
- 3 customer reviews

### Refrigerator Repair Service
**URL:** https://www.coolwind.co.in/services/refrigerator-repair
**Expected Schema:** Service
- Rating: 4.9/5 (92 reviews)
- Price Range: ₹600-₹8000
- 3 customer reviews

### Spare Parts
**URL:** https://www.coolwind.co.in/services/spare-parts
**Expected Schema:** Product
- Rating: 4.7/5 (64 reviews)
- Condition: NewCondition
- Availability: InStock
- 3 customer reviews

## Validation Tools

### 1. Google Rich Results Test
**URL:** https://search.google.com/test/rich-results

**How to Use:**
1. Enter your page URL
2. Click "Test URL"
3. Wait for results
4. Check for:
   - ✅ No errors
   - ✅ "Product" or "Service" detected
   - ✅ "Offer" present
   - ✅ "AggregateRating" present
   - ✅ "Review" present

**Expected Results:**
```
✅ Page is eligible for rich results
✅ Product/Service detected
✅ Offers: 1 item
✅ AggregateRating: 1 item
✅ Review: 2-3 items
```

### 2. Schema.org Validator
**URL:** https://validator.schema.org/

**How to Use:**
1. Visit your page
2. View page source (Ctrl+U or Cmd+U)
3. Find the JSON-LD script (search for "application/ld+json")
4. Copy the JSON content
5. Paste into validator
6. Check for errors

### 3. Manual Inspection

**View Page Source:**
```html
<!-- Look for this in page source -->
<script type="application/ld+json" id="ac-repair-service-schema">
{
  "@context": "https://schema.org/",
  "@type": "Service",
  "name": "AC Repair & Installation Service Thiruvalla",
  ...
}
</script>
```

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to Console
3. Run:
```javascript
// Extract all JSON-LD schemas
Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
  .map(s => JSON.parse(s.textContent))
```

## Common Issues & Fixes

### Issue: Schema Not Detected
**Cause:** JavaScript not executed or build error
**Fix:**
1. Check browser console for errors
2. Verify build completed successfully
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

### Issue: Missing Required Fields
**Cause:** Schema generator not called correctly
**Fix:**
1. Check `lib/schema-generator.ts` is imported
2. Verify all required props are passed
3. Check TypeScript errors: `npm run build`

### Issue: Invalid JSON
**Cause:** Syntax error in schema
**Fix:**
1. Use JSON validator: https://jsonlint.com/
2. Check for trailing commas
3. Verify quotes are properly escaped

### Issue: Reviews Not Showing
**Cause:** Review array empty or malformed
**Fix:**
1. Check `sampleReviews` in `lib/schema-generator.ts`
2. Verify review structure matches schema
3. Ensure at least 1 review is present

## Google Search Console

### Request Re-indexing

1. **Go to Google Search Console**
   - URL: https://search.google.com/search-console

2. **URL Inspection Tool**
   - Enter your page URL
   - Click "Request Indexing"

3. **Pages to Re-index:**
   - https://www.coolwind.co.in/services
   - https://www.coolwind.co.in/services/ac-repair
   - https://www.coolwind.co.in/services/refrigerator-repair
   - https://www.coolwind.co.in/services/spare-parts

4. **Monitor Results**
   - Check "Enhancements" → "Products" after 3-7 days
   - Verify errors are resolved
   - Check "Performance" for rich snippet impressions

### Expected Timeline

- **Day 0:** Deploy changes
- **Day 1-2:** Request re-indexing
- **Day 3-7:** Google re-crawls pages
- **Day 7-14:** Rich snippets may appear in search results
- **Day 14+:** Monitor click-through rate improvements

## Testing Checklist

### Pre-Deployment
- [ ] Run validation script: `node scripts/validate-schema.js`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Test locally: `npm run dev`
- [ ] View page source - schema visible
- [ ] Browser console - no errors

### Post-Deployment
- [ ] Test with Google Rich Results Test (all 4 URLs)
- [ ] Test with Schema.org Validator
- [ ] View page source on production
- [ ] Request re-indexing in Search Console
- [ ] Monitor Search Console for errors

### After 7 Days
- [ ] Check Search Console "Enhancements" → "Products"
- [ ] Verify no errors reported
- [ ] Check if rich snippets appear in search
- [ ] Monitor click-through rate changes
- [ ] Check "Performance" report for improvements

## Troubleshooting Commands

### Check Build Output
```bash
npm run build 2>&1 | tee build.log
```

### Test Specific Page
```bash
# Start dev server
npm run dev

# In another terminal, test with curl
curl http://localhost:3000/services/ac-repair | grep "application/ld+json"
```

### Validate JSON-LD
```bash
# Extract schema from page
curl -s https://www.coolwind.co.in/services/ac-repair | \
  grep -o '<script type="application/ld+json"[^>]*>.*</script>' | \
  sed 's/<[^>]*>//g'
```

## Success Metrics

### Immediate (Day 0-7)
- ✅ No errors in Google Rich Results Test
- ✅ Schema detected by validators
- ✅ All required fields present

### Short-term (Week 1-4)
- ✅ No errors in Google Search Console
- ✅ Pages re-indexed successfully
- ✅ Rich snippets appear in search results

### Long-term (Month 1-3)
- ✅ Increased click-through rate (target: +20-30%)
- ✅ Improved search rankings
- ✅ More impressions with rich snippets
- ✅ Higher conversion rate from search

## Support Resources

### Documentation
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Product](https://schema.org/Product)
- [Schema.org Service](https://schema.org/Service)
- [Google Search Central](https://developers.google.com/search/docs)

### Internal Files
- `lib/schema-generator.ts` - Schema generation utility
- `PRODUCT_SCHEMA_IMPLEMENTATION.md` - Full implementation docs
- `scripts/validate-schema.js` - Validation script

### Contact
For issues or questions, check:
1. Build logs: `npm run build`
2. Browser console (F12)
3. Google Search Console
4. Schema validators

## Quick Reference

### Test All Pages
```bash
# Validate implementation
node scripts/validate-schema.js

# Build project
npm run build

# Test locally
npm run dev
```

### Test with Google
1. Visit: https://search.google.com/test/rich-results
2. Enter URL: https://www.coolwind.co.in/services/ac-repair
3. Click "Test URL"
4. Verify: ✅ No errors, rich results eligible

### Monitor in Search Console
1. Visit: https://search.google.com/search-console
2. Go to: Enhancements → Products
3. Check: Error count should be 0
4. Monitor: Weekly for improvements
