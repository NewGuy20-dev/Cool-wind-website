# Spare Parts Feature Implementation Plan

**Status**: Awaiting client approval  
**Date**: January 13, 2025

## Overview

Plan to add spare parts catalog with images to Cool Wind Services website. This will showcase AC and refrigerator spare parts inventory with pricing, availability, and bulk order capabilities.

---

## Recommended Implementation Areas

### 1. Services Page Enhancement (`app/services/page.tsx`)
**Priority**: High  
**Effort**: Low

- Add dedicated "Spare Parts" section with image gallery
- Show categories: AC parts, refrigerator parts, genuine vs compatible
- Include hover effects to show part names/prices
- Link to full catalog page

### 2. Dedicated Spare Parts Catalog (`app/spare-parts/page.tsx`)
**Priority**: High  
**Effort**: Medium

- Full catalog page with filtering capabilities
- Filter by: appliance type, brand, part category, availability
- Grid layout with images, names, prices, stock status
- "Request Quote" and "Bulk Order" CTAs
- Search functionality
- Mobile-responsive design

### 3. Portfolio Page Integration (`app/portfolio/page.tsx`)
**Priority**: Medium  
**Effort**: Low

- Add "Parts Inventory" category alongside repair work
- Before/after comparisons showing genuine vs worn parts
- Visual proof of quality parts used in repairs
- Build customer trust through transparency

### 4. Homepage Featured Parts (`app/page.tsx`)
**Priority**: Medium  
**Effort**: Low

- Featured spare parts section
- "Popular Parts" or "In Stock Now" carousel
- Quick links to full parts catalog
- Highlight bulk order discounts

### 5. Admin Dashboard Integration (`app/dashboard-wind-ops/`)
**Priority**: High  
**Effort**: Medium

**Note**: Admin dashboard already exists at `/dashboard-wind-ops`

Add new section for spare parts management:
- Upload and manage spare parts images (single + gallery)
- Add/edit part details (name, category, brand, price, stock, specifications)
- Bulk image upload capability
- Stock management (quantity tracking, low stock alerts)
- Price management (regular price, bulk discounts)
- Part status (available, out of stock, discontinued)

### 6. Chat Widget Enhancement
**Priority**: Medium  
**Effort**: Medium

- Show inline images when users ask about parts
- Visual part identification: "Is this the part you need?"
- Link to full catalog from chat
- Quick part lookup by name or code
- **Bulk order handling via chat**:
  - Detect bulk order intent in conversation
  - Collect: part name/code, quantity, delivery location
  - Show pricing based on quantity (regular vs bulk)
  - Confirm order details in chat
  - Create order task in admin dashboard
  - Send confirmation via email + WhatsApp notification
  - Option to continue conversation on WhatsApp if needed

---

## Technical Implementation Requirements

### Database Schema (`sql/09_spare_parts_schema.sql`)

```sql
-- Spare parts table
CREATE TABLE spare_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  part_code VARCHAR(100) UNIQUE,
  category VARCHAR(100) NOT NULL, -- 'ac' or 'refrigerator'
  sub_category VARCHAR(100), -- 'compressor', 'filter', 'thermostat', etc.
  brand VARCHAR(100),
  appliance_models TEXT[], -- Compatible models
  
  -- Pricing
  price DECIMAL(10,2),
  bulk_price DECIMAL(10,2), -- Price for bulk orders
  bulk_min_quantity INTEGER, -- Minimum quantity for bulk price
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  
  -- Images
  primary_image_url TEXT,
  image_gallery TEXT[], -- Array of image URLs
  
  -- Details
  description TEXT,
  specifications JSONB, -- Flexible specs storage
  warranty_months INTEGER,
  is_genuine BOOLEAN DEFAULT true,
  
  -- SEO
  slug VARCHAR(255) UNIQUE,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_spare_parts_category ON spare_parts(category);
CREATE INDEX idx_spare_parts_brand ON spare_parts(brand);
CREATE INDEX idx_spare_parts_availability ON spare_parts(is_available);
CREATE INDEX idx_spare_parts_slug ON spare_parts(slug);

-- RLS Policies
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view available spare parts"
  ON spare_parts FOR SELECT
  USING (is_available = true);

-- Admin full access (requires auth)
CREATE POLICY "Admins can manage spare parts"
  ON spare_parts FOR ALL
  USING (auth.role() = 'authenticated');
```

### Storage Structure

```
public/
├── images/
│   └── spare-parts/
│       ├── ac/
│       │   ├── compressors/
│       │   ├── filters/
│       │   ├── thermostats/
│       │   ├── capacitors/
│       │   ├── fan-motors/
│       │   └── remote-controls/
│       └── refrigerator/
│           ├── compressors/
│           ├── door-seals/
│           ├── thermostats/
│           ├── defrost-timers/
│           ├── fan-motors/
│           └── shelves/
```

### Data File (`data/spare-parts.json`)

Static catalog for quick loading, synced with database:

```json
{
  "categories": [
    {
      "id": "ac",
      "name": "AC Parts",
      "subcategories": ["compressors", "filters", "thermostats", "capacitors", "fan-motors", "remote-controls"]
    },
    {
      "id": "refrigerator",
      "name": "Refrigerator Parts",
      "subcategories": ["compressors", "door-seals", "thermostats", "defrost-timers", "fan-motors", "shelves"]
    }
  ],
  "featured_parts": [],
  "popular_brands": ["LG", "Samsung", "Whirlpool", "Godrej", "Voltas", "Blue Star"]
}
```

### API Routes (`app/api/spare-parts/`)

```
app/api/spare-parts/
├── route.ts              # GET (list with filters), POST (admin: create)
├── [id]/
│   └── route.ts         # GET (single), PUT (admin: update), DELETE (admin: delete)
├── search/
│   └── route.ts         # POST (search by name, code, specs)
├── categories/
│   └── route.ts         # GET (list categories with counts)
└── featured/
    └── route.ts         # GET (featured/popular parts)
```

### Component Structure

```
components/
├── spare-parts/
│   ├── PartsGrid.tsx           # Grid layout for parts listing
│   ├── PartCard.tsx            # Individual part card
│   ├── PartFilters.tsx         # Filter sidebar/panel
│   ├── PartSearch.tsx          # Search input with autocomplete
│   ├── PartDetails.tsx         # Detailed part view modal
│   ├── ImageGallery.tsx        # Image carousel for part
│   ├── BulkOrderForm.tsx       # Bulk order request form
│   └── StockBadge.tsx          # Stock status indicator
└── admin/
    └── spare-parts/
        ├── PartsManager.tsx    # Admin parts list
        ├── PartForm.tsx        # Add/edit part form
        ├── ImageUploader.tsx   # Multi-image upload
        └── StockManager.tsx    # Stock quantity management
```

### Library Updates (`lib/`)

```
lib/
├── spare-parts/
│   ├── client.ts              # Client-side queries
│   ├── server.ts              # Server-side queries
│   ├── types.ts               # TypeScript types
│   └── validation.ts          # Zod schemas
└── supabase/
    └── spare-parts.ts         # Supabase service layer
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create database schema and migrations
- [ ] Set up storage folder structure
- [ ] Create API routes for CRUD operations
- [ ] Build TypeScript types and validation schemas
- [ ] Set up Supabase service layer

### Phase 2: Admin Interface (Week 1-2)
- [ ] Add spare parts section to `/dashboard-wind-ops`
- [ ] Build parts management UI (list, add, edit, delete)
- [ ] Implement image upload (single + gallery)
- [ ] Add stock management features
- [ ] Create bulk import functionality (CSV/Excel)

### Phase 3: Customer-Facing Pages (Week 2)
- [ ] Build dedicated catalog page (`/spare-parts`)
- [ ] Implement filtering and search
- [ ] Create part detail view/modal
- [ ] Add to services page
- [ ] Add featured parts to homepage

### Phase 4: Enhancements (Week 3)
- [ ] Integrate with chat widget for part inquiries
- [ ] Add bulk order flow to chat widget
- [ ] Add to portfolio page
- [ ] Implement standalone bulk order request form (backup option)
- [ ] Add email notifications for inquiries
- [ ] Add WhatsApp notification integration
- [ ] SEO optimization (meta tags, structured data)

### Phase 5: Testing & Launch (Week 3-4)
- [ ] Test all CRUD operations
- [ ] Test image uploads and display
- [ ] Mobile responsiveness testing
- [ ] Performance optimization
- [ ] Client review and feedback
- [ ] Production deployment

---

## Key Features to Include

### Customer Features
- ✅ Browse parts by category and brand
- ✅ Search by part name, code, or compatible model
- ✅ View detailed specifications and images
- ✅ Check stock availability
- ✅ See bulk pricing options
- ✅ Request quotes for bulk orders
- ✅ Filter by genuine vs compatible parts
- ✅ Mobile-friendly interface

### Admin Features
- ✅ Add/edit/delete spare parts
- ✅ Upload multiple images per part
- ✅ Manage stock quantities
- ✅ Set pricing (regular + bulk)
- ✅ Mark parts as available/unavailable
- ✅ Track low stock alerts
- ✅ Bulk import from spreadsheet
- ✅ View part inquiry analytics

### Technical Features
- ✅ Real-time stock updates via Supabase
- ✅ Image optimization and lazy loading
- ✅ SEO-friendly URLs (slugs)
- ✅ Structured data for search engines
- ✅ Responsive image galleries
- ✅ Fast search with debouncing
- ✅ Caching for better performance

---

## Design Considerations

### UI/UX
- Clean grid layout with clear product images
- Prominent "In Stock" / "Out of Stock" badges
- Easy-to-use filters (collapsible on mobile)
- Quick view modal for part details
- Clear pricing display (regular vs bulk)
- Trust indicators (genuine parts, warranty info)

### Mobile Optimization
- Touch-friendly filter controls
- Swipeable image galleries
- Sticky "Request Quote" button
- Optimized image sizes for mobile data
- Fast loading with progressive enhancement

### SEO Strategy
- Unique meta descriptions per part
- Structured data (Product schema)
- Descriptive alt text for images
- SEO-friendly URLs (/spare-parts/ac-compressor-lg-1-5-ton)
- Sitemap inclusion

---

## Business Benefits

1. **Increased Revenue**: Direct spare parts sales channel
2. **Customer Convenience**: Easy browsing and ordering
3. **Transparency**: Clear pricing and availability
4. **Bulk Orders**: Attract B2B customers and technicians
5. **Reduced Calls**: Self-service part lookup
6. **Inventory Management**: Track stock levels efficiently
7. **Marketing**: Showcase genuine parts quality
8. **SEO**: Rank for part-specific searches

---

## Next Steps

**Awaiting client approval to proceed with implementation.**

Once approved:
1. Confirm specific parts to include in initial catalog
2. Gather part images and specifications
3. Finalize pricing structure (regular + bulk)
4. Begin Phase 1 implementation
5. Set up staging environment for client review

---

## WhatsApp Integration for Bulk Orders

### Approach: Chat Widget First, WhatsApp as Extension

**Primary Flow**: Use existing Gemini-powered chat widget
- Customer initiates bulk order in chat
- AI collects all necessary details
- Creates order task in admin dashboard
- Sends confirmation email + WhatsApp notification

**WhatsApp Extension** (Optional):
- After order confirmation in chat, offer WhatsApp option
- "Continue this conversation on WhatsApp?" button
- Opens WhatsApp with pre-filled order summary
- Allows real-time negotiation and updates
- Personal touch for high-value orders

### Implementation Details

#### Chat Widget Enhancements
```typescript
// Bulk order detection in chat
- Intent: "bulk order", "wholesale", "10+ units", "dealer price"
- Collect: part details, quantity, delivery location, contact
- Show: pricing tiers, availability, delivery timeline
- Action: Create order task + send notifications
```

#### WhatsApp Integration Options

**Option A: Simple Link (Recommended for Start)**
```typescript
// After order confirmation in chat
const whatsappMessage = encodeURIComponent(`
Order Confirmation - Cool Wind Services

Order ID: #${orderId}
Parts Requested:
${parts.map(p => `- ${p.name} x ${p.quantity}`).join('\n')}

Total Estimate: ₹${totalPrice}
Delivery: ${location}

I'd like to discuss this order further.
`);

const whatsappUrl = `https://wa.me/918547229991?text=${whatsappMessage}`;
```

**Option B: WhatsApp Business API (Future)**
- Automated responses for order status
- Payment link sharing
- Delivery updates
- Requires Meta approval + monthly cost (₹500-2000)

### Benefits of Chat-First Approach

1. **Unified Experience**: Everything starts in one place
2. **AI-Powered**: Gemini handles complex queries
3. **Tracked**: All orders logged in admin dashboard
4. **Flexible**: Can escalate to WhatsApp when needed
5. **Cost-Effective**: No additional API costs initially
6. **Familiar**: Customers already using the chat widget

### User Flow

```
Customer: "I need 10 AC compressors for LG 1.5 ton"
    ↓
Chat AI: Identifies bulk order intent
    ↓
Chat AI: "I can help with that! Let me get some details..."
    ↓
Collects: Exact model, quantity, delivery location, timeline
    ↓
Shows: Pricing (bulk discount applied), availability, delivery estimate
    ↓
Customer: Confirms interest
    ↓
Chat AI: "Great! I've created your order request."
    ↓
Creates task in admin dashboard
    ↓
Sends email confirmation to customer
    ↓
Sends WhatsApp notification to business number
    ↓
Chat AI: "Would you like to continue on WhatsApp for faster updates?"
    ↓
[Continue on WhatsApp] button → Opens WhatsApp with order summary
    ↓
Business team follows up via WhatsApp or phone
```

### Database Schema Addition

```sql
-- Add to spare_parts_orders table
CREATE TABLE spare_parts_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer info
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  delivery_location TEXT,
  
  -- Order details
  items JSONB NOT NULL, -- Array of {part_id, quantity, price}
  total_amount DECIMAL(10,2),
  bulk_discount_applied BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, delivered, cancelled
  
  -- Communication
  chat_conversation_id UUID, -- Link to chat history
  whatsapp_conversation_started BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Chat Widget Updates Needed

1. **Intent Detection**: Add bulk order patterns to AI prompts
2. **Order Collection Flow**: Multi-step conversation for details
3. **Pricing Display**: Show bulk discounts in chat
4. **Order Confirmation**: Summary with order number
5. **WhatsApp Handoff**: Button to continue on WhatsApp
6. **Admin Notification**: Real-time alert for new bulk orders

### Admin Dashboard Updates

- New "Bulk Orders" section
- View order details and chat history
- Update order status
- Send WhatsApp/email updates to customer
- Track conversion rate (chat → confirmed order)

## Notes

- Existing admin dashboard at `/dashboard-wind-ops` will be extended
- Integration with existing task/ticket system for part inquiries
- Inventory alerts to admin notifications for low stock
- **Chat widget will be primary interface for bulk orders**
- WhatsApp serves as optional extension for personal follow-up
- Future: Consider adding "Request Part" feature for unlisted items
- Future: WhatsApp Business API for automated order updates

---

---

## Summary

This implementation plan focuses on creating a comprehensive spare parts catalog with:
- **Customer-facing catalog** with search, filters, and detailed views
- **Admin management** integrated into existing `/dashboard-wind-ops`
- **Chat-first bulk ordering** using existing Gemini AI chat widget
- **WhatsApp integration** as optional extension for personal follow-up
- **Scalable architecture** that can grow with business needs

The chat widget approach leverages existing infrastructure while providing a seamless experience for bulk orders, with the flexibility to escalate to WhatsApp when customers prefer more personal communication.

---

**Document created**: January 13, 2025  
**Last updated**: January 13, 2025  
**Status**: Pending client approval
