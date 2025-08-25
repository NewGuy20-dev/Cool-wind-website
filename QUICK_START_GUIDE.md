# 🚀 Quick Start Guide - Failed Call Management System

## ⚡ Immediate Solution for "Secret does not exist" Error

The error you're seeing indicates that the `GOOGLE_AI_API_KEY` environment variable is not properly configured. Here are **3 quick ways** to fix this:

## 🔧 Option 1: Automated Setup (Recommended)

Run the setup script to configure everything automatically:

```bash
node scripts/setup-environment.js
```

This will:
- Guide you through setting up your Google AI API key
- Configure the admin password  
- Create the `.env.local` file with all required variables
- Test the configuration

## 🔧 Option 2: Manual Setup

1. **Create `.env.local` file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` with your values**:
   ```env
   GOOGLE_AI_API_KEY=your_actual_api_key_here
   ADMIN_KEY=your_secure_password
   ```

3. **Get Google AI API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in and create an API key
   - Copy the key to your `.env.local` file

## 🔧 Option 3: Skip Gemini (Use Fallback Only)

If you want to test the system **without** the Google AI API:

1. **Create minimal `.env.local`**:
   ```env
   # Skip GOOGLE_AI_API_KEY - system will use fallback patterns
   ADMIN_KEY=your_secure_password
   ```

2. **Test the system**:
   ```bash
   node scripts/test-extraction-only.js
   ```

The system will automatically use improved regex patterns instead of Gemini AI.

## ✅ Verification

After setup, test that everything works:

```bash
# Test extraction patterns
node scripts/test-extraction-only.js

# Start the development server
npm run dev

# Access admin dashboard
# http://localhost:3000/admin/tasks
```

## 🎯 Expected Results

With the original problem case:
```
Input: "my name is gautham and phone no is 9544654402 and location is thiruvalla and problem is Ac burst"

Results:
✅ Name: "gautham" 
✅ Phone: "9544654402"
✅ Location: "Thiruvalla"
✅ Problem: "Ac burst"
```

## 🚨 For Vercel Deployment

If you're deploying to Vercel, you need to set the secret:

```bash
# Set environment variables in Vercel dashboard
# Go to Settings → Environment Variables in your Vercel project

# Or use Vercel CLI
vercel env add GOOGLE_AI_API_KEY production
vercel env add ADMIN_KEY production
```

## 💡 Key Points

1. **System works without Gemini**: The fallback patterns are highly accurate
2. **Gemini enhances accuracy**: But it's not required for basic functionality  
3. **All original issues are fixed**: Name, phone, location extraction works perfectly
4. **Admin dashboard included**: Full task management interface
5. **Production ready**: Complete error handling and validation

## 🎉 Success Indicators

You'll know the setup worked when:
- ✅ No "Secret does not exist" errors
- ✅ Test scripts run successfully  
- ✅ Development server starts without errors
- ✅ Admin dashboard is accessible
- ✅ Customer information extracts correctly

The failed call management system is now **fully functional** and ready to handle customer callback requests! 🚀