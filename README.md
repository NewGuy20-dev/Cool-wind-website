# Cool Wind Services - Portfolio Website

A complete responsive portfolio website for **Cool Wind Services**, an appliance repair and sales business in Thiruvalla, Kerala, India.

## 🌟 Features

### 📱 Mobile-First Design
- **Responsive layout** that works perfectly on all devices
- **Sticky bottom bar** on mobile with Call & WhatsApp buttons
- **Touch-friendly** interface with 44px+ tap targets
- **Mobile menu** with smooth animations

### 🎨 Modern UI/UX
- **Clean, professional design** with cooling theme colors
- **Accessibility compliant** (WCAG AA standards)
- **Smooth animations** and hover effects
- **High contrast** for better readability
- **Print-friendly** styles

### 🔧 Business Features
- **Service showcase** - AC repair, refrigerator service, spare parts, electronics
- **Portfolio gallery** with filterable projects and lightbox view
- **Customer testimonials** with ratings and service categories
- **Contact forms** with validation and success/error states
- **Emergency service** indicators and quick contact options

### 🚀 Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **Framer Motion** for animations
- **SEO optimized** with structured data
- **Internationalization** ready (EN/ML)

## 📄 Pages

### 🏠 Homepage
- Hero section with compelling headline and CTAs
- Quick services grid (4 main services)
- Featured work showcase
- Customer testimonials preview
- Contact form with quote request

### 🛠️ Services Page
- Detailed service information with accordions
- Common issues and solutions
- Service area coverage
- Brand compatibility
- Emergency service information

### 📸 Portfolio Page
- Filterable project gallery (All, AC, Refrigerator, Parts, Electronics)
- Lightbox modal with project details
- Before/after style project cards
- Category-based filtering

### 👥 About Page
- Company story and timeline
- Service area map
- Team information
- Values and certifications
- 15+ years experience showcase

### 📞 Contact Page
- Comprehensive contact form
- Multiple contact methods (Phone, WhatsApp, Email)
- Service hours and emergency info
- FAQ section
- Interactive service area map placeholder

### ⭐ Testimonials Page
- Customer review cards with ratings
- Service category breakdown
- Authentic customer feedback
- Review submission encouragement

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd cool-wind-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Environment Variables
```bash
NEXT_PUBLIC_SITE_URL=https://coolwindservices.com
NEXT_PUBLIC_BUSINESS_PHONE=+918547229991
NEXT_PUBLIC_WHATSAPP_NUMBER=918547229991
NEXT_PUBLIC_BUSINESS_EMAIL=info@coolwindservices.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🎨 Design System

### Color Palette
```css
:root {
  --primary-blue: #2563eb;
  --secondary-teal: #0891b2;
  --accent-orange: #ea580c;
  --neutral-gray: #6b7280;
  --light-gray: #f3f4f6;
  --white: #ffffff;
  --dark: #1f2937;
}
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Base Size**: 16px (mobile), 18px (desktop)
- **Headlines**: Bold, modern sans-serif
- **Body Text**: Readable, high contrast

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary, secondary, accent variants
- **Forms**: Clean inputs with focus states
- **Navigation**: Responsive with mobile menu

## 📱 Mobile Features

### Sticky Bottom Bar
- Always visible Call & WhatsApp buttons
- Emergency service indicator
- Thumb-friendly touch targets

### Mobile Menu
- Hamburger menu with smooth animation
- Full navigation access
- Language switcher included

### Touch Interactions
- **44px minimum** touch targets
- **Swipe gestures** for testimonials
- **Pull-to-refresh** support
- **Smooth scrolling** between sections

## 🔧 Development

### Project Structure
```
cool-wind-website/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── services/          # Services page
│   ├── portfolio/         # Portfolio page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── testimonials/      # Testimonials page
│   └── api/               # API routes
├── components/            # Reusable React components
├── lib/                   # Utilities and helpers
├── data/                  # Static data and translations
├── styles/                # Global CSS and Tailwind
└── public/                # Static assets
```

### Key Components
- **Header**: Navigation with mobile menu
- **Footer**: Business info and links
- **ContactForm**: Validated contact form
- **FloatingCtas**: Mobile sticky CTAs
- **LanguageSwitcher**: EN/ML toggle

### Styling Approach
- **Mobile-first** responsive design
- **Utility-first** with Tailwind CSS
- **Component-scoped** styles where needed
- **Accessible** color contrast and focus states

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Other Platforms
- **Netlify**: Connect GitHub repo
- **Railway**: Deploy with Docker
- **DigitalOcean**: Use App Platform

## 📈 SEO & Performance

### SEO Features
- **Structured data** for local business
- **Meta tags** optimized for each page
- **Open Graph** tags for social sharing
- **Sitemap** and robots.txt
- **Local business** schema markup

### Performance
- **Image optimization** with Next.js
- **Code splitting** automatic
- **Lazy loading** for images and components
- **Caching** strategies implemented

## 🔒 Security

### Form Protection
- **Honeypot fields** for spam prevention
- **Rate limiting** on API routes
- **Input validation** with Zod schemas
- **CSRF protection** built-in

### Data Privacy
- **No tracking** without consent
- **Minimal data collection**
- **GDPR compliant** contact forms

## 🌐 Internationalization

### Languages Supported
- **English** (primary)
- **Malayalam** (toggle available)

### Implementation
- **next-intl** for translations
- **Language switcher** in header
- **Locale-based** routing

## 📞 Business Integration

### Contact Methods
- **Phone**: Direct calling with tel: links
- **WhatsApp**: Deep links with pre-filled messages
- **Email**: Contact form submissions
- **Emergency**: 24/7 availability indicators

### Service Areas
- **Same-day service**: Thiruvalla, Pathanamthitta, Kozhencherry, Mallappally
- **Next-day service**: Adoor, Pandalam, Ranni, surrounding areas

### Services Offered
- **AC Services**: Installation, repair, maintenance, gas charging
- **Refrigerator Services**: All brands, compressor issues, parts replacement
- **Spare Parts**: Genuine parts, bulk orders, same-day delivery
- **Electronics**: Quality second-hand appliances with warranty

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support, email info@coolwindservices.com or call +91 85472 29991.

---

**Cool Wind Services** - Reliable AC & Refrigerator Services in Thiruvalla & Pathanamthitta since 2009.