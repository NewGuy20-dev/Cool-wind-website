# Debug Instructions - Find the Actual Issue

## 🔍 Step-by-Step Debugging

Since the code is correct but you're still seeing errors, let's find out what's actually being rendered.

### Step 1: Check the Deployed Page Source

1. Open your browser (Chrome/Edge/Firefox)
2. Visit: **https://www.coolwind.co.in/services/spare-parts/ac**
3. Press **Ctrl+U** (or right-click → View Page Source)
4. Press **Ctrl+F** and search for: `application/ld+json`
5. You should see something like:

```html
<script type="application/ld+json" id="ac-parts-product-schema">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "AC Spare Parts Thiruvalla",
  ...
}
</script>
```

### Step 2: Copy the JSON

Copy EVERYTHING between the `<script>` tags (the entire JSON object).

### Step 3: Check for "image" Field

In the JSON you copied, search for `"image"`:

**If you see:**
```json
"image": [],
```
✅ The field IS there - Google's cache needs to clear

**If you DON'T see it:**
```json
"name": "AC Spare Parts Thiruvalla",
"description": "...",
"brand": {
```
❌ The field is missing - build issue

### Step 4: Alternative - Use Browser Console

1. Visit: https://www.coolwind.co.in/services/spare-parts/ac
2. Press **F12** (open DevTools)
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach((script, index) => {
  console.log(`Schema ${index + 1}:`, JSON.parse(script.textContent));
});
```

5. Look at the output - does it show `image: []`?

### Step 5: Check Build Output

Run this locally to see what's being generated:

```bash
# Clean build
rm -rf .next
npm run build

# Check the build output
# Look for any warnings about the schema
```

### Step 6: Test Locally

```bash
# Start dev server
npm run dev

# Visit: http://localhost:3000/services/spare-parts/ac
# View source (Ctrl+U)
# Check if "image": [] is there
```

## 🎯 What to Look For

### Scenario A: Image field IS in page source
**Symptoms:**
- View source shows `"image": []`
- Google Rich Results Test still shows error

**Cause:** Google's cache hasn't updated

**Solution:**
1. Wait 24 hours
2. Use "Request Indexing" in Google Search Console
3. Add `?v=2` to URL when testing: `https://www.coolwind.co.in/services/spare-parts/ac?v=2`

### Scenario B: Image field NOT in page source
**Symptoms:**
- View source doesn't show `"image"` field
- Local code has it, but deployed doesn't

**Cause:** Build/deployment issue

**Solution:**
1. Clear build cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Redeploy
4. Check Vercel build logs for errors

### Scenario C: Image field is there but empty array causes error
**Symptoms:**
- View source shows `"image": []`
- Google says empty array is invalid

**Cause:** Google requires at least one image URL

**Solution:** Add a placeholder image:

```typescript
// In app/services/spare-parts/ac/page.tsx
const productSchema = generateProductSchema({
  // ... other props
  image: ['https://www.coolwind.co.in/images/placeholder-product.jpg'],
})
```

## 📊 Quick Test Commands

### Test 1: Check if file was modified
```bash
git log --oneline -5 lib/schema-generator.ts
git log --oneline -5 app/layout.tsx
```

### Test 2: Check current content
```bash
# Windows PowerShell
Get-Content lib/schema-generator.ts | Select-String "image"
Get-Content app/layout.tsx | Select-String "image"
```

### Test 3: Verify build includes changes
```bash
npm run build 2>&1 | findstr /i "error"
```

## 🚨 Common Issues

### Issue 1: Vercel Build Cache
**Problem:** Vercel is using cached build
**Solution:** 
- Go to Vercel dashboard
- Settings → General → Clear Build Cache
- Redeploy

### Issue 2: CDN Cache
**Problem:** Cloudflare/CDN caching old version
**Solution:**
- Purge CDN cache
- Wait 10-15 minutes
- Test with cache-busting URL

### Issue 3: Browser Cache
**Problem:** Your browser is showing cached version
**Solution:**
- Open Incognito/Private window
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache

## 📝 Report Back

After checking, tell me:

1. **Is `"image": []` in the page source?** (Yes/No)
2. **What does the browser console show?** (Copy the schema object)
3. **Are you testing the deployed site or localhost?** (Which URL?)
4. **When was the last deployment?** (Check Vercel dashboard)

This will help me identify the exact issue!

## 🎯 Quick Fix Options

### Option A: Use Placeholder Image (Immediate)
If Google doesn't accept empty arrays, add a placeholder:

```typescript
// Create a simple 1x1 transparent PNG as placeholder
image: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==']
```

### Option B: Use Logo (Better)
```typescript
image: ['https://www.coolwind.co.in/logo.png']
```

### Option C: Wait for Client Photos (Best)
Keep empty array, wait for real product photos.

---

**Next Step:** Follow Step 1-4 above and report what you find!
