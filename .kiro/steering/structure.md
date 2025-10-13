# Project Structure

## Root Organization

```
├── app/                    # Next.js App Router (pages & API routes)
├── components/             # React components
├── lib/                    # Utilities, services, types
├── data/                   # Static JSON data
├── sql/                    # Database migrations & scripts
├── scripts/                # Automation & testing scripts
├── public/                 # Static assets
├── styles/                 # Global CSS
└── tests/                  # E2E tests
```

## App Directory (`app/`)

Next.js 15 App Router structure with route groups:

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Homepage
├── globals.css             # Global styles
├── not-found.tsx           # 404 page
├── about/                  # About page
├── services/               # Services page
├── portfolio/              # Portfolio gallery
├── contact/                # Contact page
├── testimonials/           # Testimonials pages
│   ├── page.tsx           # List view
│   └── add/page.tsx       # Add testimonial
├── admin/                  # Admin dashboard
│   └── testimonials/      # Admin testimonial management
└── api/                    # API routes
    ├── chat/              # AI chat endpoint
    ├── tasks/             # Task management
    ├── admin/             # Admin APIs (auth required)
    ├── testimonials/      # Testimonials CRUD
    └── failed-calls/      # Failed call tracking
```

## Components (`components/`)

Reusable React components organized by feature:

```
components/
├── admin/                  # Admin-specific components
├── chat/                   # Chat widget components
│   ├── ChatWidget.tsx     # Main chat interface
│   ├── ChatMessage.tsx    # Message display
│   └── QuickReplies.tsx   # Quick action buttons
├── ui/                     # Generic UI components
├── ChatWidget.tsx          # Chat widget wrapper
├── ConditionalLayout.tsx   # Layout wrapper
├── ContactForm.tsx         # Contact form
├── CookieConsent.tsx       # Cookie banner
├── FloatingCtas.tsx        # Mobile sticky CTAs
├── Footer.tsx              # Site footer
├── Header.tsx              # Site header
├── MotionProvider.tsx      # Framer Motion provider
├── PageTransition.tsx      # Page transitions
├── Providers.tsx           # App providers wrapper
└── TestimonialCarousel.tsx # Testimonial slider
```

## Library (`lib/`)

Business logic, utilities, and integrations:

```
lib/
├── chat/                   # Chat system logic
│   ├── conversation-context.ts  # Context management
│   ├── business-logic.ts        # Business rules
│   └── error-handler.ts         # Error handling
├── gemini/                 # Google AI integration
│   └── client.ts          # Gemini API client
├── supabase/               # Supabase integration
│   ├── client.ts          # Client instance
│   ├── server.ts          # Server instance
│   └── tasks.ts           # Task service
├── hooks/                  # React hooks
├── storage/                # Storage utilities
├── types/                  # TypeScript types
├── validation/             # Validation schemas
├── ai-classification.ts    # AI intent classification
├── ai-priority-analyzer.ts # Task priority AI
├── analytics.ts            # Analytics helpers
├── chat-agent-integration.ts  # Chat agent logic
├── env.ts                  # Environment validation
├── failed-calls-db.ts      # Failed calls DB
├── failed-calls-types.ts   # Failed calls types
├── testimonials.ts         # Testimonials service
├── ticket-service.ts       # Ticket service
└── utils.ts                # General utilities
```

## Data (`data/`)

Static JSON configuration:

```
data/
├── portfolio.json          # Portfolio projects
├── services.json           # Service offerings
├── site-config.json        # Site configuration
├── testimonials.json       # Testimonials data
└── failed-calls.json       # Failed calls log
```

## SQL (`sql/`)

Database schema and migrations:

```
sql/
├── migrations/             # Migration files
│   ├── up/                # Forward migrations
│   ├── down/              # Rollback migrations
│   └── applied/           # Migration tracking
├── backups/                # Database backups
├── scripts/                # SQL utility scripts
├── 00_database_setup.sql   # Initial setup
├── 01_core_schema.sql      # Core tables
├── 02_indexes_constraints.sql  # Indexes
├── 03_rls_policies.sql     # Row-level security
├── 04_triggers_functions.sql   # Triggers & functions
├── 05_views_procedures.sql     # Views & procedures
├── 06_seed_data.sql        # Seed data
├── 07_production_config.sql    # Production config
├── 08_testimonials_schema.sql  # Testimonials tables
└── verify_schema.sql       # Schema verification
```

## Scripts (`scripts/`)

Automation and testing scripts:

```
scripts/
├── seed-chat-failed-calls.ts      # Seed chat data
├── seed-failed-calls.js           # Seed failed calls
├── test-chat.js                   # Test chat system
├── test-failed-call-detection.js  # Test detection
├── test-full-system.js            # Integration tests
├── test-integration.sh            # Test runner
└── validate-implementation.js     # Validation
```

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `ChatWidget.tsx`)
- **Utilities**: kebab-case (e.g., `ai-classification.ts`)
- **API routes**: kebab-case folders with `route.ts`
- **Pages**: `page.tsx` in route folders

### Import Aliases
- `@/*` - Maps to project root
- Example: `import { supabase } from '@/lib/supabase/client'`

### Component Organization
- One component per file
- Co-locate related components in folders
- Separate UI components from business logic
- Use barrel exports (`index.ts`) for clean imports

### API Route Structure
- `route.ts` exports HTTP method handlers (GET, POST, etc.)
- Use `NextRequest` and `NextResponse`
- Validate inputs with Zod schemas
- Return consistent JSON response format

### Type Definitions
- Shared types in `lib/types/`
- Component-specific types in same file
- Database types generated from Supabase
- Use TypeScript strict mode

### Styling Approach
- Tailwind utility classes preferred
- Global styles in `app/globals.css`
- Component-scoped styles when needed
- Mobile-first responsive design
- Custom colors in `tailwind.config.ts`

### State Management
- React Context for global state
- `useReducer` for complex state logic
- Server state via Supabase real-time
- Form state via React Hook Form

### Error Handling
- Try-catch in API routes
- Error boundaries for React components
- Graceful degradation for AI failures
- User-friendly error messages
