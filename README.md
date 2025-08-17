# Cool Wind Services Website

- Next.js 14 (App Router), TypeScript, Tailwind CSS, next-intl
- GA4 custom events, Nodemailer SMTP for contact form

## Setup

1. Copy `.env.example` to `.env.local` and fill values
2. Install deps: `npm ci`
3. Dev: `npm run dev`
4. Build: `npm run build`

## Content

- JSON data in `data/` controls services, testimonials, portfolio
- Translations in `data/translations/{en,ml}.json`

## Deployment

- Recommended: Vercel. Add env vars in project settings
- Ensure `NEXT_PUBLIC_SITE_URL` is set

## Tracking

- GA4 events fired via `lib/analytics.ts`
- Update tags in Google Analytics as needed

## Security

- Honeypot + rate limit in `/api/contact`
- Update SMTP credentials securely

## TODO

- Portfolio lightbox, masonry, filters
- Malayalam content expansion
- Sitemap and robots verified