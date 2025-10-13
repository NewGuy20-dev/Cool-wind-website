# Technology Stack

## Framework & Runtime

- **Next.js 15.4.7** with App Router
- **React 19.1.1** with React DOM
- **TypeScript 5.9.2** (strict mode enabled)
- **Node.js 18.17+** required

## Core Libraries

### UI & Styling
- **Tailwind CSS 3.4.16** - utility-first styling
- **Framer Motion 12.23.12** - animations
- **Lucide React** - icon library
- **Heroicons** - additional icons
- **clsx** + **tailwind-merge** - conditional classes

### Forms & Validation
- **React Hook Form 7.62.0** - form management
- **Zod 4.0.17** - schema validation
- **@hookform/resolvers** - form validation integration

### Backend & Database
- **Supabase** (@supabase/supabase-js 2.56.0) - PostgreSQL database, auth, real-time
- **Google Gemini AI** (@google/generative-ai 0.24.1) - AI chat support
- **Nodemailer 7.0.5** - email handling

### Analytics & Monitoring
- **Vercel Analytics** - web analytics
- **Vercel Speed Insights** - performance monitoring
- **Pino 9.4.0** - logging
- **prom-client 15.1.3** - metrics

### Testing & Automation
- **Playwright 1.55.0** - E2E testing
- **Puppeteer 24.16.2** - browser automation
- **ts-node** - TypeScript execution

## Build System

### Development
```bash
npm run dev          # Start dev server (localhost:3000)
npm run lint         # Run ESLint
npm test             # Run simple tests
```

### Production
```bash
npm run build        # Build for production
npm run postbuild    # Generate sitemap after build
npm run sitemap      # Generate sitemap manually
```

### Database Operations
```bash
# Seed data
npx ts-node scripts/seed-chat-failed-calls.ts
npx ts-node scripts/seed-failed-calls.js

# Test systems
node scripts/test-chat.js
node scripts/test-failed-call-detection.js
node scripts/test-full-system.js
```

## Configuration Files

- **next.config.mjs** - Next.js config with CSP headers
- **tailwind.config.ts** - Tailwind customization with brand colors
- **tsconfig.json** - TypeScript config (strict, ES2022 target)
- **postcss.config.js** - PostCSS with Tailwind
- **eslint.config.json** - ESLint rules
- **playwright.config.ts** - E2E test config
- **next-sitemap.config.js** - Sitemap generation

## Environment Variables

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-side only

# Google AI
GOOGLE_AI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash-exp

# Business
NEXT_PUBLIC_BUSINESS_PHONE=+918547229991
NEXT_PUBLIC_WHATSAPP_NUMBER=918547229991
NEXT_PUBLIC_BUSINESS_EMAIL=info@coolwindservices.com

# Admin
ADMIN_KEY=  # For admin API endpoints

# Analytics
NEXT_PUBLIC_GA_ID=  # Google Analytics
```

## API Routes

All API routes in `app/api/`:
- `/api/tasks/auto-create` - Task creation with AI priority
- `/api/admin/tasks` - Admin task management (requires auth)
- `/api/chat` - Gemini AI chat endpoint
- `/api/testimonials` - Testimonials CRUD
- `/api/failed-calls` - Failed call tracking

## Database

- **PostgreSQL** via Supabase
- **Migrations** in `sql/` directory
- **RLS policies** enabled for security
- **Real-time subscriptions** for live updates
- **Stored procedures** for complex queries

## Deployment

- **Platform**: Vercel (optimized for Next.js)
- **Build command**: `npm run build`
- **Output directory**: `.next`
- **Node version**: 18.17+
- **Function timeout**: 30s for AI endpoints

## Code Style

- **TypeScript strict mode** enabled
- **ESLint** for linting
- **Path aliases**: `@/*` maps to project root
- **No `allowJs`** - TypeScript only
- **Module resolution**: Bundler
