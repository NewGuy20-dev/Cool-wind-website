# Environment Setup Guide

## 🔑 Required Environment Variables

The failed call management system requires the following environment variables to be configured:

### 1. Google AI API Key (Required)

You need a Google AI API key to use Gemini 2.0 Flash for intelligent information extraction.

#### Getting Your API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

#### Setting the Variable:
```bash
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

### 2. Admin Key (Required)
Set a secure password for admin dashboard access:
```bash
ADMIN_KEY=your_secure_admin_password
```

### 3. Optional Configuration:
```bash
GEMINI_MODEL=gemini-2.0-flash-exp
CHAT_SESSION_TIMEOUT=1800000
MAX_MESSAGES_PER_SESSION=50
ENABLE_CHAT_ANALYTICS=true
```

## 🛠️ Setup Methods

### Method 1: Local Development (.env.local)

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your actual values:
   ```bash
   GOOGLE_AI_API_KEY=AIzaSyC-your-actual-api-key-here
   ADMIN_KEY=MySecurePassword123
   ```

### Method 2: Vercel Deployment

If you're using Vercel, you need to set up the secret:

1. **Option A: Vercel CLI**
   ```bash
   # Set the secret
   vercel secrets add google_ai_api_key "AIzaSyC-your-actual-api-key-here"
   
   # Set admin key
   vercel env add ADMIN_KEY
   # Then enter your admin password when prompted
   ```

2. **Option B: Vercel Dashboard**
   - Go to your project settings in Vercel dashboard
   - Navigate to "Environment Variables"
   - Add `GOOGLE_AI_API_KEY` with your API key
   - Add `ADMIN_KEY` with your admin password

3. **Update vercel.json** (if needed):
   The current `vercel.json` references `@google_ai_api_key` secret, which should work once you set it up.

### Method 3: Other Deployment Platforms

For other platforms (Railway, Render, etc.), set these environment variables in your platform's dashboard:

```
GOOGLE_AI_API_KEY=your_api_key
ADMIN_KEY=your_admin_password
GEMINI_MODEL=gemini-2.0-flash-exp
```

## 🧪 Testing the Setup

1. **Test without Gemini** (uses fallback patterns):
   ```bash
   node scripts/test-extraction-only.js
   ```

2. **Test with Gemini** (requires API key):
   ```bash
   node scripts/test-gemini-extraction.js
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access admin dashboard**:
   ```
   http://localhost:3000/admin/tasks
   ```
   Use your `ADMIN_KEY` value as the password.

## 🚨 Security Notes

1. **Never commit API keys** to version control
2. **Use strong admin passwords** 
3. **Rotate keys regularly** in production
4. **Set up proper CORS** for production domains

## 🔍 Troubleshooting

### "Secret does not exist" Error
- **Vercel**: Make sure you've added the secret: `vercel secrets add google_ai_api_key "your_key"`
- **Local**: Check that `.env.local` exists and has the correct variable name

### "Unauthorized" in Admin Dashboard
- Check that `ADMIN_KEY` is set correctly
- Make sure you're using the same value you set in the environment

### "Gemini API Error"
- Verify your API key is correct and active
- Check Google AI Studio for usage limits
- The system will fall back to regex patterns if Gemini fails

### "Module not found" Errors
- Make sure you've run `npm install`
- Check that all dependencies are installed

## 📝 Environment File Template

Create `.env.local` with this template:

```env
# Copy this template and fill in your actual values

# Required: Get from https://makersuite.google.com/app/apikey  
GOOGLE_AI_API_KEY=

# Required: Set a secure admin password
ADMIN_KEY=

# Optional: Gemini model (default shown)
GEMINI_MODEL=gemini-2.0-flash-exp

# Optional: Chat configuration
CHAT_SESSION_TIMEOUT=1800000
MAX_MESSAGES_PER_SESSION=50
ENABLE_CHAT_ANALYTICS=true
```

## ✅ Verification Checklist

- [ ] Google AI API key obtained and set
- [ ] Admin key configured
- [ ] Test scripts run successfully
- [ ] Development server starts without errors
- [ ] Admin dashboard accessible
- [ ] Chat system responds to messages
- [ ] Failed call detection works

Once all environment variables are properly configured, the failed call management system will be fully operational!