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
├── featured/
│   └── route.ts         # GET (featured/popular parts)
└── orders/
    ├── route.ts         # GET (list orders), POST (create order)
    └── [id]/
        └── route.ts     # GET (single order), PUT (update status)
```

#### API Endpoint Details

**GET /api/spare-parts**
```typescript
// Query Parameters:
{
  category?: 'ac' | 'refrigerator';
  brand?: string;
  sub_category?: string;
  search?: string;
  in_stock?: boolean;
  is_genuine?: boolean;
  min_price?: number;
  max_price?: number;
  sort?: 'name' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number; // default: 20
}

// Response:
{
  parts: SparePart[];
  total: number;
  page: number;
  pages: number;
  filters: {
    categories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    price_range: { min: number; max: number };
  };
}
```

**POST /api/spare-parts** (Admin only)
```typescript
// Request Body: Validated with sparePartSchema
// Response: { part: SparePart; message: string }
// Auth: Requires ADMIN_KEY header
```

**GET /api/spare-parts/[id]**
```typescript
// Response: { part: SparePart; related_parts: SparePart[] }
// Includes: Related parts from same category/brand
```

**PUT /api/spare-parts/[id]** (Admin only)
```typescript
// Request Body: Partial<SparePart>
// Response: { part: SparePart; message: string }
```

**DELETE /api/spare-parts/[id]** (Admin only)
```typescript
// Response: { message: string }
// Also deletes: Associated images from storage
```

**POST /api/spare-parts/search**
```typescript
// Request Body:
{
  query: string;
  filters?: {
    category?: string;
    brand?: string;
  };
  limit?: number; // default: 10
}

// Response:
{
  results: SparePart[];
  suggestions: string[]; // Autocomplete suggestions
}
```

**GET /api/spare-parts/categories**
```typescript
// Response:
{
  categories: [
    {
      id: 'ac';
      name: 'AC Parts';
      count: 45;
      subcategories: [
        { id: 'compressors'; name: 'Compressors'; count: 12 },
        { id: 'filters'; name: 'Filters'; count: 8 },
        // ...
      ];
    },
    // ...
  ];
}
```

**GET /api/spare-parts/featured**
```typescript
// Response:
{
  featured: SparePart[]; // Top 8 parts
  popular: SparePart[]; // Most viewed
  new_arrivals: SparePart[]; // Recently added
}
```

**POST /api/spare-parts/orders** (Create bulk order)
```typescript
// Request Body: Validated with bulkOrderSchema
{
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_location: string;
  items: [
    { part_id: string; quantity: number }
  ];
  source?: 'chat' | 'form' | 'whatsapp';
  chat_conversation_id?: string;
}

// Response:
{
  order: BulkOrder;
  order_number: string;
  whatsapp_link: string;
  message: string;
}

// Side Effects:
// - Creates order in database
// - Sends customer confirmation email
// - Sends admin notification email
// - Logs order in admin dashboard
```

**GET /api/spare-parts/orders** (Admin only)
```typescript
// Query Parameters:
{
  status?: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  page?: number;
  limit?: number;
}

// Response:
{
  orders: BulkOrder[];
  total: number;
  page: number;
  stats: {
    pending: number;
    confirmed: number;
    total_value: number;
  };
}
```

**PUT /api/spare-parts/orders/[id]** (Admin only)
```typescript
// Request Body:
{
  status?: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  notes?: string;
}

// Response: { order: BulkOrder; message: string }
// Side Effect: Sends status update email to customer
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
│   ├── StockBadge.tsx          # Stock status indicator
│   ├── PriceDisplay.tsx        # Price with bulk discount info
│   ├── PartSpecifications.tsx  # Specifications table
│   ├── RelatedParts.tsx        # Related parts carousel
│   └── RecentlyViewed.tsx      # Recently viewed parts
└── admin/
    └── spare-parts/
        ├── PartsManager.tsx    # Admin parts list
        ├── PartForm.tsx        # Add/edit part form
        ├── ImageUploader.tsx   # Multi-image upload
        ├── StockManager.tsx    # Stock quantity management
        ├── OrdersManager.tsx   # Bulk orders list
        ├── OrderDetails.tsx    # Single order view
        ├── CSVImporter.tsx     # CSV bulk import
        └── StockAlerts.tsx     # Low stock notifications
```

#### Component Props & Interfaces

**PartsGrid.tsx**
```typescript
interface PartsGridProps {
  parts: SparePart[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
```

**PartCard.tsx**
```typescript
interface PartCardProps {
  part: SparePart;
  onQuickView: (part: SparePart) => void;
  onAddToInquiry?: (part: SparePart) => void;
  compact?: boolean;
}
```

**PartFilters.tsx**
```typescript
interface PartFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableFilters: {
    categories: { id: string; name: string; count: number }[];
    brands: { id: string; name: string; count: number }[];
    priceRange: { min: number; max: number };
  };
  isMobile?: boolean;
}

interface FilterState {
  category?: string;
  brands?: string[];
  subCategories?: string[];
  priceRange?: [number, number];
  inStock?: boolean;
  isGenuine?: boolean;
}
```

**PartDetails.tsx**
```typescript
interface PartDetailsProps {
  part: SparePart;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote: (part: SparePart) => void;
  onBulkOrder: (part: SparePart) => void;
}
```

**BulkOrderForm.tsx**
```typescript
interface BulkOrderFormProps {
  initialPart?: SparePart;
  onSubmit: (order: BulkOrderData) => Promise<void>;
  onCancel: () => void;
}

interface BulkOrderData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_location: string;
  items: { part_id: string; quantity: number }[];
  notes?: string;
}
```

**ImageUploader.tsx**
```typescript
interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number; // default: 10
  maxSizeMB?: number; // default: 5
  primaryImageIndex?: number;
  onPrimaryChange?: (index: number) => void;
}
```

### Library Updates (`lib/`)

```
lib/
├── spare-parts/
│   ├── client.ts              # Client-side queries
│   ├── server.ts              # Server-side queries
│   ├── types.ts               # TypeScript types
│   ├── validation.ts          # Zod schemas
│   ├── utils.ts               # Helper functions
│   └── constants.ts           # Constants (categories, brands)
├── supabase/
│   └── spare-parts.ts         # Supabase service layer
└── email/
    ├── mailer.ts              # Nodemailer setup
    ├── templates.ts           # Email templates
    ├── send.ts                # Send functions
    └── types.ts               # Email types
```

#### Library Function Details

**lib/spare-parts/client.ts** (Client-side React hooks)
```typescript
// React Query hooks for client-side data fetching
export function useParts(filters: FilterState) {
  // Fetches parts with filters, pagination
  // Returns: { data, isLoading, error, fetchMore }
}

export function usePart(id: string) {
  // Fetches single part with related parts
  // Returns: { part, relatedParts, isLoading, error }
}

export function usePartSearch(query: string) {
  // Debounced search with autocomplete
  // Returns: { results, suggestions, isLoading }
}

export function useCategories() {
  // Fetches categories with counts
  // Returns: { categories, isLoading }
}

export function useFeaturedParts() {
  // Fetches featured/popular parts
  // Returns: { featured, popular, newArrivals, isLoading }
}

export function useRecentlyViewed() {
  // Gets recently viewed parts from localStorage
  // Returns: { parts, addToRecent, clearRecent }
}
```

**lib/spare-parts/server.ts** (Server-side functions)
```typescript
// Server-side functions for API routes
export async function getParts(filters: FilterState): Promise<PartsResponse> {
  // Queries Supabase with filters
  // Returns paginated results with metadata
}

export async function getPart(id: string): Promise<PartWithRelated> {
  // Gets single part + related parts
}

export async function createPart(data: CreatePartData): Promise<SparePart> {
  // Validates and creates new part
  // Generates slug, handles images
}

export async function updatePart(id: string, data: UpdatePartData): Promise<SparePart> {
  // Updates existing part
}

export async function deletePart(id: string): Promise<void> {
  // Deletes part and associated images
}

export async function searchParts(query: string, filters?: FilterState): Promise<SearchResults> {
  // Full-text search with filters
}

export async function createBulkOrder(data: BulkOrderData): Promise<BulkOrder> {
  // Creates order, sends emails, returns order
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<BulkOrder> {
  // Updates order status, sends notification
}
```

**lib/spare-parts/utils.ts**
```typescript
// Utility functions
export function generateSlug(name: string): string {
  // Converts name to URL-friendly slug
  // Example: "AC Compressor LG 1.5 Ton" → "ac-compressor-lg-1-5-ton"
}

export function calculateBulkPrice(part: SparePart, quantity: number): number {
  // Returns price based on quantity (regular or bulk)
}

export function formatPrice(price: number): string {
  // Formats price as ₹X,XXX.XX
}

export function getStockStatus(part: SparePart): 'in_stock' | 'low_stock' | 'out_of_stock' {
  // Determines stock status based on quantity and threshold
}

export function generateOrderNumber(): string {
  // Generates unique order number: CW-YYYYMMDD-XXXX
}

export function optimizeImage(file: File): Promise<File> {
  // Resizes and compresses image before upload
}

export function validatePartCode(code: string): boolean {
  // Validates part code format
}
```

**lib/spare-parts/constants.ts**
```typescript
export const CATEGORIES = [
  { id: 'ac', name: 'AC Parts', icon: '❄️' },
  { id: 'refrigerator', name: 'Refrigerator Parts', icon: '🧊' },
] as const;

export const SUB_CATEGORIES = {
  ac: [
    'compressors',
    'filters',
    'thermostats',
    'capacitors',
    'fan-motors',
    'remote-controls',
    'pcb-boards',
    'sensors',
  ],
  refrigerator: [
    'compressors',
    'door-seals',
    'thermostats',
    'defrost-timers',
    'fan-motors',
    'shelves',
    'ice-makers',
    'water-filters',
  ],
} as const;

export const BRANDS = [
  'LG',
  'Samsung',
  'Whirlpool',
  'Godrej',
  'Voltas',
  'Blue Star',
  'Daikin',
  'Hitachi',
  'Carrier',
  'Haier',
] as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  OUT_OF_STOCK: 0,
} as const;

export const BULK_ORDER_MIN_QUANTITY = 5;

export const IMAGE_CONSTRAINTS = {
  MAX_SIZE_MB: 5,
  MAX_IMAGES: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
```

**lib/email/templates.ts**
```typescript
export function bulkOrderCustomerEmail(data: BulkOrderEmailData): EmailTemplate {
  // Returns HTML + plain text customer confirmation email
  // Includes: Order details, pricing, contact info, WhatsApp link
}

export function bulkOrderAdminEmail(data: BulkOrderEmailData): EmailTemplate {
  // Returns HTML admin notification email
  // Includes: Customer details, order summary, dashboard link
}

export function orderStatusUpdateEmail(data: OrderStatusEmailData): EmailTemplate {
  // Returns status update email for customer
  // Includes: New status, tracking info, next steps
}

export function lowStockAlertEmail(parts: SparePart[]): EmailTemplate {
  // Returns low stock alert for admin
  // Includes: List of low stock parts, reorder suggestions
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}
```

**lib/email/send.ts**
```typescript
export async function sendBulkOrderEmails(orderData: BulkOrderEmailData): Promise<EmailResult> {
  // Sends both customer confirmation and admin notification
  // Returns: { success: boolean; error?: string }
}

export async function sendOrderStatusUpdate(orderId: string, newStatus: OrderStatus): Promise<EmailResult> {
  // Sends status update to customer
}

export async function sendLowStockAlert(parts: SparePart[]): Promise<EmailResult> {
  // Sends low stock alert to admin
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

---

## Implementation Phases

### Phase 1: Foundation & Database Setup (Days 1-3)

#### Day 1: Database Schema
- [ ] **Create migration file**: `sql/09_spare_parts_schema.sql`
  - spare_parts table with all fields
  - spare_parts_orders table for bulk orders
  - Indexes for performance (category, brand, slug, availability)
  - RLS policies (public read, admin write)
  - Triggers for updated_at timestamps
- [ ] **Run migration** on Supabase project
- [ ] **Verify schema** with test queries
- [ ] **Create backup** of database before migration

#### Day 2: Type Definitions & Validation
- [ ] **Create TypeScript types** (`lib/spare-parts/types.ts`):
  ```typescript
  export interface SparePart {
    id: string;
    name: string;
    part_code: string;
    category: 'ac' | 'refrigerator';
    sub_category: string;
    brand: string;
    appliance_models: string[];
    price: number;
    bulk_price: number;
    bulk_min_quantity: number;
    stock_quantity: number;
    low_stock_threshold: number;
    is_available: boolean;
    primary_image_url: string;
    image_gallery: string[];
    description: string;
    specifications: Record<string, any>;
    warranty_months: number;
    is_genuine: boolean;
    slug: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface BulkOrder {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    delivery_location: string;
    items: OrderItem[];
    total_amount: number;
    bulk_discount_applied: boolean;
    status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
    chat_conversation_id?: string;
    whatsapp_conversation_started: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface OrderItem {
    part_id: string;
    part_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }
  ```

- [ ] **Create Zod validation schemas** (`lib/spare-parts/validation.ts`):
  ```typescript
  import { z } from 'zod';
  
  export const sparePartSchema = z.object({
    name: z.string().min(3).max(255),
    part_code: z.string().optional(),
    category: z.enum(['ac', 'refrigerator']),
    sub_category: z.string(),
    brand: z.string(),
    appliance_models: z.array(z.string()),
    price: z.number().positive(),
    bulk_price: z.number().positive().optional(),
    bulk_min_quantity: z.number().int().positive().optional(),
    stock_quantity: z.number().int().min(0).default(0),
    low_stock_threshold: z.number().int().positive().default(5),
    is_available: z.boolean().default(true),
    primary_image_url: z.string().url(),
    image_gallery: z.array(z.string().url()).optional(),
    description: z.string(),
    specifications: z.record(z.any()).optional(),
    warranty_months: z.number().int().positive().optional(),
    is_genuine: z.boolean().default(true),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    meta_description: z.string().max(160).optional(),
  });
  
  export const bulkOrderSchema = z.object({
    customer_name: z.string().min(2),
    customer_phone: z.string().regex(/^[+]?[0-9]{10,15}$/),
    customer_email: z.string().email(),
    delivery_location: z.string().min(5),
    items: z.array(z.object({
      part_id: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1),
  });
  ```

#### Day 3: API Routes Foundation
- [ ] **Create base API structure**:
  - `app/api/spare-parts/route.ts` - List & Create
  - `app/api/spare-parts/[id]/route.ts` - Get, Update, Delete
  - `app/api/spare-parts/search/route.ts` - Search functionality
  - `app/api/spare-parts/categories/route.ts` - Category listing
  - `app/api/spare-parts/featured/route.ts` - Featured parts
  - `app/api/spare-parts/orders/route.ts` - Bulk orders

- [ ] **Implement GET /api/spare-parts** (with filters):
  ```typescript
  // Query params: category, brand, search, inStock, page, limit
  // Returns: { parts: SparePart[], total: number, page: number }
  ```

- [ ] **Implement POST /api/spare-parts** (admin only):
  ```typescript
  // Validate with Zod schema
  // Generate slug from name
  // Insert into Supabase
  // Return created part
  ```

- [ ] **Add authentication middleware** for admin routes
- [ ] **Test all endpoints** with Postman/Thunder Client

### Phase 2: Admin Dashboard (Days 4-7)

#### Day 4: Admin Parts List View
- [ ] **Create admin route**: `app/dashboard-wind-ops/spare-parts/page.tsx`
- [ ] **Build PartsManager component** (`components/admin/spare-parts/PartsManager.tsx`):
  - Table view with columns: Image, Name, Code, Category, Brand, Stock, Price, Status, Actions
  - Pagination (20 items per page)
  - Search bar (real-time filtering)
  - Filter dropdowns (category, brand, availability)
  - Sort options (name, price, stock, date)
  - Bulk actions (delete, mark unavailable)
  - "Add New Part" button
  - Low stock indicators (red badge if stock < threshold)
  - Quick edit inline for stock quantity

- [ ] **Add to dashboard navigation** sidebar
- [ ] **Implement real-time updates** with Supabase subscriptions
- [ ] **Add loading states** and error handling

#### Day 5: Admin Part Form (Add/Edit)
- [ ] **Create PartForm component** (`components/admin/spare-parts/PartForm.tsx`):
  - Form fields:
    - Basic Info: Name, Part Code, Category, Sub-category, Brand
    - Pricing: Regular Price, Bulk Price, Bulk Min Quantity
    - Inventory: Stock Quantity, Low Stock Threshold, Availability Toggle
    - Details: Description (textarea), Warranty (months)
    - Specifications: Dynamic key-value pairs (add/remove)
    - Compatible Models: Tag input (add/remove)
    - Images: Primary image + gallery uploader
    - SEO: Auto-generated slug (editable), Meta description
  - Form validation with React Hook Form + Zod
  - Real-time slug preview
  - Image preview before upload
  - Save as draft / Publish options
  - Cancel with unsaved changes warning

- [ ] **Create modal/page for add/edit**
- [ ] **Implement form submission** with loading states
- [ ] **Add success/error notifications**

#### Day 6: Image Upload System
- [ ] **Create ImageUploader component** (`components/admin/spare-parts/ImageUploader.tsx`):
  - Drag & drop zone
  - Click to browse
  - Multiple file selection
  - Image preview thumbnails
  - Remove image button
  - Reorder images (drag to reorder)
  - Image optimization before upload (resize, compress)
  - Progress bar during upload
  - Support formats: JPG, PNG, WEBP
  - Max size: 5MB per image
  - Max gallery: 10 images

- [ ] **Set up Supabase Storage bucket**: `spare-parts-images`
  - Public read access
  - Authenticated write access
  - File size limits
  - Allowed MIME types

- [ ] **Implement upload logic**:
  ```typescript
  // Upload to: spare-parts-images/{category}/{part-code}/{filename}
  // Generate unique filenames
  // Return public URLs
  // Handle upload errors
  ```

- [ ] **Create storage folder structure** in public for static images
- [ ] **Add image deletion** when part is deleted

#### Day 7: Stock Management & Bulk Import
- [ ] **Create StockManager component** (`components/admin/spare-parts/StockManager.tsx`):
  - Quick stock adjustment (+/- buttons)
  - Bulk stock update (CSV upload)
  - Low stock alerts dashboard
  - Stock history log
  - Reorder suggestions based on sales

- [ ] **Implement CSV bulk import**:
  - Download template CSV
  - Upload CSV file
  - Validate data
  - Preview import (show errors)
  - Confirm and import
  - Show import results (success/failed)

- [ ] **Add export functionality**:
  - Export all parts to CSV
  - Export filtered results
  - Include all fields

- [ ] **Create low stock notification system**:
  - Email alert when stock < threshold
  - Dashboard badge with count
  - Weekly stock report

### Phase 3: Customer-Facing Pages (Days 8-11)

#### Day 8: Spare Parts Catalog Page
- [ ] **Create catalog route**: `app/spare-parts/page.tsx`
- [ ] **Build PartsGrid component** (`components/spare-parts/PartsGrid.tsx`):
  - Responsive grid layout (4 cols desktop, 2 cols tablet, 1 col mobile)
  - Infinite scroll or pagination
  - Loading skeletons
  - Empty state with CTA

- [ ] **Build PartCard component** (`components/spare-parts/PartCard.tsx`):
  - Product image with hover zoom
  - Part name and code
  - Brand badge
  - Price display (regular + bulk if applicable)
  - Stock badge (In Stock / Low Stock / Out of Stock)
  - Genuine parts indicator
  - Warranty info
  - Quick view button
  - Add to inquiry button
  - Favorite/bookmark option

- [ ] **Implement lazy loading** for images
- [ ] **Add SEO metadata** (title, description, Open Graph)

#### Day 9: Filters & Search
- [ ] **Create PartFilters component** (`components/spare-parts/PartFilters.tsx`):
  - Category filter (AC / Refrigerator)
  - Sub-category checkboxes
  - Brand checkboxes (with counts)
  - Price range slider
  - Availability filter
  - Genuine parts only toggle
  - Warranty filter
  - Clear all filters button
  - Mobile: Collapsible filter drawer
  - Desktop: Sticky sidebar

- [ ] **Create PartSearch component** (`components/spare-parts/PartSearch.tsx`):
  - Search input with icon
  - Autocomplete suggestions
  - Search by: name, code, brand, model
  - Recent searches
  - Popular searches
  - Debounced search (300ms)
  - Clear search button
  - Search results count

- [ ] **Implement URL query params** for filters (shareable links)
- [ ] **Add sort options**: Relevance, Price (low-high), Price (high-low), Name (A-Z), Newest

#### Day 10: Part Details Modal
- [ ] **Create PartDetails component** (`components/spare-parts/PartDetails.tsx`):
  - Full-screen modal on mobile, large modal on desktop
  - Image gallery with thumbnails
  - Zoom on click
  - Swipe gestures on mobile
  - Part information:
    - Name, code, brand
    - Category and sub-category
    - Description (formatted)
    - Specifications table
    - Compatible models list
    - Warranty information
    - Stock availability
  - Pricing section:
    - Regular price
    - Bulk pricing tiers (if applicable)
    - Savings calculator
  - Action buttons:
    - Request Quote
    - Bulk Order
    - Call Now
    - WhatsApp
    - Share (copy link, WhatsApp, email)
  - Related parts carousel
  - Recently viewed parts

- [ ] **Implement share functionality**
- [ ] **Add to recently viewed** (localStorage)
- [ ] **Track part views** (analytics)

#### Day 11: Homepage & Services Integration
- [ ] **Add featured parts section to homepage** (`app/page.tsx`):
  - "Popular Spare Parts" heading
  - Carousel with 6-8 featured parts
  - Auto-play with pause on hover
  - Navigation arrows and dots
  - "View All Parts" CTA button
  - Responsive (4 visible desktop, 2 tablet, 1 mobile)

- [ ] **Update services page** (`app/services/page.tsx`):
  - Add "Spare Parts" service card
  - Image gallery of part categories
  - Link to catalog
  - Highlight genuine parts
  - Bulk order CTA

- [ ] **Update portfolio page** (`app/portfolio/page.tsx`):
  - Add "Parts Used" category
  - Before/after images showing part replacements
  - Link to specific parts in catalog

### Phase 4: Chat Widget & Email Integration (Days 12-14)

#### Day 12: Email System Setup
- [ ] **Get Gmail app password** from client (coolwindhvac@gmail.com)
- [ ] **Add email config to .env.local**:
  ```env
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_SECURE=false
  EMAIL_USER=coolwindhvac@gmail.com
  EMAIL_PASS=app_password_here
  EMAIL_FROM="Cool Wind Services <coolwindhvac@gmail.com>"
  BUSINESS_EMAIL=coolwindhvac@gmail.com
  ```

- [ ] **Create email utility** (`lib/email/mailer.ts`):
  - Nodemailer transporter setup
  - Connection verification
  - Error handling

- [ ] **Create email templates** (`lib/email/templates.ts`):
  - Customer order confirmation (HTML + plain text)
  - Admin new order notification
  - Order status update
  - Low stock alert
  - Responsive email design
  - Cool Wind branding (colors, logo)

- [ ] **Create email service** (`lib/email/send.ts`):
  - sendBulkOrderConfirmation()
  - sendAdminOrderNotification()
  - sendOrderStatusUpdate()
  - sendLowStockAlert()
  - Error handling and retries

- [ ] **Test email sending** with real Gmail account

#### Day 13: Chat Widget Bulk Order Flow
- [ ] **Update chat AI prompts** to detect bulk order intent:
  - Keywords: "bulk", "wholesale", "10+", "dealer price", "multiple units"
  - Part inquiries: "compressor", "filter", "spare part"

- [ ] **Implement conversation flow**:
  1. Detect intent: "I see you're interested in bulk ordering!"
  2. Collect part details: "Which part do you need?"
  3. Show part options with images
  4. Collect quantity: "How many units?"
  5. Show pricing: "For X units: ₹Y (Z% bulk discount)"
  6. Collect delivery location
  7. Collect contact info (name, phone, email)
  8. Confirm order summary
  9. Create order in database
  10. Send confirmation email
  11. Offer WhatsApp handoff

- [ ] **Add inline part images** in chat responses
- [ ] **Add quick reply buttons**: "Request Quote", "View Catalog", "Talk to Human"
- [ ] **Implement order creation** from chat
- [ ] **Add WhatsApp handoff button** with pre-filled message

#### Day 14: WhatsApp Integration
- [ ] **Create WhatsApp message templates**:
  - Order confirmation message
  - Order status update
  - Payment reminder
  - Delivery notification

- [ ] **Implement WhatsApp link generation**:
  ```typescript
  function generateWhatsAppLink(orderData: BulkOrder): string {
    const message = `
Order #${orderData.order_number}
${orderData.items.map(i => `${i.part_name} x ${i.quantity}`).join('\n')}
Total: ₹${orderData.total_amount}
    `.trim();
    
    return `https://wa.me/918547229991?text=${encodeURIComponent(message)}`;
  }
  ```

- [ ] **Add WhatsApp buttons** throughout:
  - Part details modal
  - Bulk order form
  - Order confirmation page
  - Chat widget

- [ ] **Create admin WhatsApp notification**:
  - Send to business number when new order received
  - Include customer details and order summary

### Phase 5: SEO & Performance (Days 15-16)

#### Day 15: SEO Optimization
- [ ] **Add structured data** (JSON-LD):
  - Product schema for each part
  - BreadcrumbList for navigation
  - Organization schema
  - LocalBusiness schema

- [ ] **Optimize meta tags**:
  - Unique title for each part page
  - Unique meta descriptions (max 160 chars)
  - Open Graph tags (og:image, og:title, og:description)
  - Twitter Card tags

- [ ] **Generate sitemap entries** for spare parts:
  - Add to next-sitemap.config.js
  - Include all part pages
  - Set priority and changefreq

- [ ] **Add canonical URLs**
- [ ] **Implement breadcrumbs** on all pages
- [ ] **Optimize image alt text** (descriptive, includes keywords)
- [ ] **Add internal linking** between related parts

#### Day 16: Performance Optimization
- [ ] **Image optimization**:
  - Use Next.js Image component
  - Lazy loading
  - Responsive images (srcset)
  - WebP format with fallbacks
  - Blur placeholder

- [ ] **Code splitting**:
  - Dynamic imports for heavy components
  - Lazy load modals and drawers
  - Route-based code splitting

- [ ] **Caching strategy**:
  - Cache API responses (SWR or React Query)
  - Cache static data (categories, brands)
  - Revalidate on demand
  - Cache-Control headers

- [ ] **Database query optimization**:
  - Use indexes effectively
  - Limit fields in SELECT
  - Pagination for large datasets
  - Avoid N+1 queries

- [ ] **Bundle size optimization**:
  - Analyze bundle with @next/bundle-analyzer
  - Remove unused dependencies
  - Tree-shake libraries
  - Minimize CSS

- [ ] **Lighthouse audit**:
  - Performance score > 90
  - Accessibility score > 95
  - Best Practices score > 90
  - SEO score > 95

### Phase 6: Testing & QA (Days 17-18)

#### Day 17: Functional Testing
- [ ] **Admin Dashboard Testing**:
  - [ ] Create new part (all fields)
  - [ ] Upload images (single + gallery)
  - [ ] Edit existing part
  - [ ] Delete part (with confirmation)
  - [ ] Bulk import CSV
  - [ ] Export to CSV
  - [ ] Stock management (increase/decrease)
  - [ ] Low stock alerts
  - [ ] Search and filters
  - [ ] Pagination
  - [ ] Sort options

- [ ] **Customer Catalog Testing**:
  - [ ] Browse all parts
  - [ ] Filter by category
  - [ ] Filter by brand
  - [ ] Filter by price range
  - [ ] Search by name
  - [ ] Search by part code
  - [ ] View part details
  - [ ] Image gallery (zoom, swipe)
  - [ ] Related parts
  - [ ] Share part link

- [ ] **Bulk Order Flow Testing**:
  - [ ] Chat widget bulk order
  - [ ] Collect all required info
  - [ ] Show pricing correctly
  - [ ] Create order in database
  - [ ] Send confirmation email
  - [ ] Send admin notification
  - [ ] WhatsApp handoff link
  - [ ] Order appears in admin dashboard

- [ ] **Email Testing**:
  - [ ] Customer confirmation email (HTML + plain text)
  - [ ] Admin notification email
  - [ ] Email deliverability (check spam folder)
  - [ ] Email rendering (Gmail, Outlook, mobile)

#### Day 18: Cross-Browser & Device Testing
- [ ] **Browser Testing**:
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
  - [ ] Mobile browsers (Chrome, Safari)

- [ ] **Device Testing**:
  - [ ] Desktop (1920x1080, 1366x768)
  - [ ] Tablet (iPad, Android tablet)
  - [ ] Mobile (iPhone, Android phones)
  - [ ] Small mobile (320px width)

- [ ] **Responsive Design**:
  - [ ] All breakpoints work correctly
  - [ ] Images scale properly
  - [ ] Text is readable
  - [ ] Buttons are tappable (min 44x44px)
  - [ ] Forms are usable on mobile
  - [ ] Modals work on all devices

- [ ] **Accessibility Testing**:
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] Color contrast (WCAG AA)
  - [ ] Focus indicators
  - [ ] Alt text for images
  - [ ] ARIA labels
  - [ ] Form labels

- [ ] **Performance Testing**:
  - [ ] Page load time < 3s
  - [ ] Time to interactive < 5s
  - [ ] Image loading (lazy load works)
  - [ ] API response times
  - [ ] Database query performance

### Phase 7: Client Review & Launch (Days 19-21)

#### Day 19: Staging Deployment
- [ ] **Deploy to staging environment**:
  - [ ] Vercel preview deployment
  - [ ] Connect to staging Supabase project
  - [ ] Add staging environment variables
  - [ ] Test all functionality on staging

- [ ] **Prepare demo data**:
  - [ ] Add 20-30 sample parts
  - [ ] Upload part images
  - [ ] Create sample bulk orders
  - [ ] Set realistic pricing

- [ ] **Create demo video**:
  - [ ] Admin dashboard walkthrough
  - [ ] Customer catalog browsing
  - [ ] Bulk order flow
  - [ ] Email notifications

- [ ] **Prepare documentation**:
  - [ ] Admin user guide (how to add parts, manage stock)
  - [ ] Customer FAQ
  - [ ] Troubleshooting guide

#### Day 20: Client Review
- [ ] **Schedule review meeting** with client
- [ ] **Demo all features**:
  - [ ] Show admin dashboard
  - [ ] Add a new part live
  - [ ] Show customer catalog
  - [ ] Complete bulk order flow
  - [ ] Show email notifications

- [ ] **Collect feedback**:
  - [ ] Feature requests
  - [ ] UI/UX improvements
  - [ ] Pricing adjustments
  - [ ] Content changes

- [ ] **Make requested changes**
- [ ] **Second review** if needed

#### Day 21: Production Launch
- [ ] **Final pre-launch checklist**:
  - [ ] All tests passing
  - [ ] No console errors
  - [ ] All images optimized
  - [ ] SEO tags complete
  - [ ] Analytics tracking working
  - [ ] Error monitoring setup (Sentry)

- [ ] **Production deployment**:
  - [ ] Deploy to production Vercel
  - [ ] Connect to production Supabase
  - [ ] Add production environment variables
  - [ ] Verify email sending works
  - [ ] Test WhatsApp links

- [ ] **Post-launch monitoring**:
  - [ ] Monitor error logs
  - [ ] Check analytics
  - [ ] Monitor email deliverability
  - [ ] Watch for performance issues
  - [ ] Collect user feedback

- [ ] **Launch announcement**:
  - [ ] Update website homepage
  - [ ] Social media posts
  - [ ] Email to existing customers
  - [ ] WhatsApp status update

---

## Detailed Technical Specifications

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

---

## Email Configuration & Setup

### Email Options Analysis

**Domain email via ImprovMX**: `info@coolwind.co.in` ✅ **RECOMMENDED**
- Most professional appearance (custom domain)
- Free email forwarding service
- MX records configured: coolwind.co.in → ImprovMX → Gmail
- Forwards to developer Gmail, can CC client if needed
- Provides multiple addresses: info@, orders@, support@coolwind.co.in

**DNS Setup Status:**
- ✅ MX records added in GoDaddy
- ⚠️ SPF record needs to be added (prevents spam)
- ⏳ Waiting for DNS propagation (up to 24 hours)

**Required DNS Records in GoDaddy:**
```
Type: MX, Name: @, Value: mx1.improvmx.com, Priority: 10
Type: MX, Name: @, Value: mx2.improvmx.com, Priority: 20
Type: TXT, Name: @, Value: v=spf1 include:spf.improvmx.com ~all
```

**Alternative setup**: Client's business Gmail `coolwindhvac@gmail.com`
- Backup option if domain email has issues
- Still professional for HVAC business
- Client maintains direct control
- Requires app password from client

### Recommended Email Configuration

**Primary Setup** (Using ImprovMX with domain email - RECOMMENDED):
```env
# Email Configuration  
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=gauthamrkrishna8@gmail.com
EMAIL_PASS=developer_app_password_here
EMAIL_FROM="Cool Wind Services <info@coolwind.co.in>"
BUSINESS_EMAIL=info@coolwind.co.in
```

**How it works:**
- Emails sent from: info@coolwind.co.in (professional)
- Emails forwarded to: gauthamrkrishna8@gmail.com (via ImprovMX)
- Client receives in their Gmail inbox
- Replies go to info@coolwind.co.in (also forwarded)

**Alternative Setup** (Using client's business Gmail - backup option):
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=coolwindhvac@gmail.com
EMAIL_PASS=client_app_password_here
EMAIL_FROM="Cool Wind Services <coolwindhvac@gmail.com>"
BUSINESS_EMAIL=coolwindhvac@gmail.com
```

### Required from Client

**For Business Gmail Setup**:
1. **App Password Generation**:
   - Login to coolwindhvac@gmail.com
   - Google Account → Security → 2-Step Verification (enable if needed)
   - App passwords → Generate new → Mail + Custom name: "Website"
   - Share 16-character password securely

2. **Email Access**:
   - Client should monitor coolwindhvac@gmail.com for customer inquiries
   - Or set up forwarding to personal Gmail if preferred

### Email Templates & Functionality

**Customer Confirmation Email**:
- Order number and details
- Estimated pricing with bulk discounts
- Delivery location confirmation
- Contact information (phone + WhatsApp)
- Professional HTML template with Cool Wind branding

**Admin Notification Email**:
- New bulk order alert
- Customer contact details
- Order summary with total value
- Direct link to admin dashboard
- Quick action buttons (Call customer, WhatsApp)

**Email Service Implementation** (`lib/email/`):
```
lib/email/
├── mailer.ts          # Nodemailer transporter setup
├── templates.ts       # HTML email templates
├── send.ts           # Email sending functions
└── types.ts          # Email data types
```

### Email Integration Points

1. **Bulk Order Confirmation** (Chat Widget):
   - Customer completes order in chat
   - Automatic email confirmation sent
   - Admin notification triggered

2. **Manual Order Creation** (Admin Dashboard):
   - Admin creates order manually
   - Customer confirmation email sent
   - Order tracking email sequence

3. **Order Status Updates**:
   - Status change notifications
   - Delivery confirmations
   - Payment reminders (if applicable)

### Backup Email Strategy

**Primary**: Client's business Gmail (coolwindhvac@gmail.com)
**Backup**: Domain email forwarding (info@coolwind.co.in)
**Fallback**: WhatsApp notifications if email fails

This ensures reliable communication even if one method fails.

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

## Security Considerations

### Authentication & Authorization
- **Admin routes**: Protected with ADMIN_KEY header validation
- **API endpoints**: Rate limiting to prevent abuse
- **File uploads**: Validate file types, sizes, and scan for malware
- **SQL injection**: Use parameterized queries (Supabase handles this)
- **XSS protection**: Sanitize user inputs, use React's built-in escaping

### Data Protection
- **Customer data**: Encrypt sensitive information (phone, email)
- **Payment info**: Never store payment details (if added later)
- **RLS policies**: Ensure proper row-level security in Supabase
- **CORS**: Restrict API access to allowed origins
- **HTTPS**: Enforce HTTPS in production

### Input Validation
- **Server-side validation**: Always validate on server (Zod schemas)
- **Client-side validation**: For better UX, but not security
- **File uploads**: Check MIME types, file extensions, sizes
- **Email validation**: Verify email format and domain
- **Phone validation**: Check format and length

### Error Handling
- **Don't expose internals**: Generic error messages to users
- **Log errors**: Detailed logs for debugging (Sentry, Pino)
- **Graceful degradation**: App works even if features fail
- **Retry logic**: For transient failures (email, API calls)

---

## Performance Targets

### Page Load Times
- **Homepage**: < 2 seconds (LCP)
- **Catalog page**: < 3 seconds (LCP)
- **Part details**: < 2 seconds (LCP)
- **Admin dashboard**: < 3 seconds (LCP)

### API Response Times
- **GET /api/spare-parts**: < 500ms
- **GET /api/spare-parts/[id]**: < 300ms
- **POST /api/spare-parts**: < 1s
- **Search**: < 400ms

### Image Optimization
- **Format**: WebP with JPEG fallback
- **Compression**: 80% quality
- **Lazy loading**: Below-the-fold images
- **Responsive**: Multiple sizes (srcset)
- **CDN**: Use Vercel's image optimization

### Database Performance
- **Indexes**: On frequently queried columns
- **Query optimization**: Limit fields, use pagination
- **Caching**: Cache static data (categories, brands)
- **Connection pooling**: Supabase handles this

### Bundle Size
- **Initial JS**: < 200KB gzipped
- **Total JS**: < 500KB gzipped
- **CSS**: < 50KB gzipped
- **Code splitting**: Route-based and component-based

---

## Monitoring & Analytics

### Error Monitoring
- **Tool**: Sentry or similar
- **Track**: JavaScript errors, API failures, email failures
- **Alerts**: Notify on critical errors
- **Source maps**: For debugging production errors

### Performance Monitoring
- **Tool**: Vercel Analytics, Web Vitals
- **Metrics**: LCP, FID, CLS, TTFB
- **Alerts**: Notify on performance degradation
- **Real User Monitoring**: Track actual user experience

### Business Analytics
- **Track**:
  - Part views (most popular)
  - Search queries (what users look for)
  - Bulk order conversions (chat → order)
  - Email open rates
  - WhatsApp handoff rate
  - Stock alerts triggered
  - Low stock parts
  - Revenue by category/brand

- **Tools**: Google Analytics, Vercel Analytics
- **Dashboards**: Admin dashboard with key metrics

### User Behavior
- **Heatmaps**: Where users click (Hotjar, Microsoft Clarity)
- **Session recordings**: Understand user flows
- **Funnel analysis**: Catalog → Part Details → Order
- **A/B testing**: Test different layouts, CTAs

---

## Maintenance & Support

### Regular Tasks
- **Weekly**:
  - Review low stock alerts
  - Check bulk order status
  - Monitor error logs
  - Review analytics

- **Monthly**:
  - Update part prices
  - Add new parts
  - Review and respond to customer feedback
  - Performance audit
  - Security updates

- **Quarterly**:
  - Database cleanup (old orders, unused images)
  - Feature enhancements based on feedback
  - SEO audit and improvements
  - Competitor analysis

### Backup Strategy
- **Database**: Daily automated backups (Supabase)
- **Images**: Stored in Supabase Storage (redundant)
- **Code**: Version controlled (Git)
- **Restore procedure**: Documented and tested

### Update Procedures
- **Part updates**: Through admin dashboard
- **Bulk updates**: CSV import
- **Price changes**: Bulk update tool
- **Stock updates**: Manual or automated

### Support Channels
- **Admin support**: Email, WhatsApp
- **Customer support**: Chat widget, phone, WhatsApp
- **Technical issues**: Developer contact
- **Documentation**: Admin guide, FAQ

---

## Future Enhancements (Post-Launch)

### Phase 2 Features (3-6 months)
- [ ] **Customer accounts**: Save favorites, order history
- [ ] **Wishlist**: Save parts for later
- [ ] **Compare parts**: Side-by-side comparison
- [ ] **Reviews & ratings**: Customer reviews for parts
- [ ] **Advanced search**: Filter by specifications
- [ ] **Part recommendations**: AI-powered suggestions
- [ ] **Inventory sync**: Auto-update from supplier
- [ ] **Payment integration**: Online payment for orders
- [ ] **Delivery tracking**: Real-time order tracking
- [ ] **Mobile app**: React Native app for customers

### Phase 3 Features (6-12 months)
- [ ] **Dealer portal**: Separate login for dealers
- [ ] **Loyalty program**: Points for repeat customers
- [ ] **Subscription service**: Regular part deliveries
- [ ] **Video tutorials**: Installation guides
- [ ] **AR preview**: See part in 3D
- [ ] **Multi-language**: Malayalam, Hindi support
- [ ] **Voice search**: Search by voice
- [ ] **Chatbot improvements**: More intelligent responses
- [ ] **Predictive analytics**: Forecast demand
- [ ] **Supplier integration**: Direct ordering from suppliers

### Integration Opportunities
- [ ] **Accounting software**: QuickBooks, Tally integration
- [ ] **CRM**: Customer relationship management
- [ ] **ERP**: Enterprise resource planning
- [ ] **Shipping partners**: Delhivery, Blue Dart API
- [ ] **Payment gateways**: Razorpay, Paytm
- [ ] **SMS notifications**: Order updates via SMS
- [ ] **WhatsApp Business API**: Automated messages
- [ ] **Google Merchant Center**: Show parts in Google Shopping

---

## Cost Breakdown (Estimated)

### One-Time Costs
- **Development**: Included (already budgeted)
- **Initial part photography**: ₹5,000-10,000 (if hiring photographer)
- **Stock images**: ₹0 (use own photos)
- **Domain email setup**: ₹0 (using ImprovMX free)

### Monthly Costs
- **Hosting (Vercel)**: ₹0 (free tier sufficient initially)
- **Database (Supabase)**: ₹0 (free tier: 500MB, 2GB bandwidth)
- **Email (Gmail)**: ₹0 (using existing business Gmail)
- **Storage**: ₹0 (included in Supabase free tier)
- **Total**: ₹0/month initially

### Scaling Costs (When Needed)
- **Vercel Pro**: $20/month (~₹1,650) - if traffic grows
- **Supabase Pro**: $25/month (~₹2,000) - if database grows
- **WhatsApp Business API**: ₹500-2,000/month - if automation needed
- **Email service (SendGrid)**: ₹0-₹1,000/month - if volume grows
- **CDN/Image optimization**: Included in Vercel

### ROI Expectations
- **Break-even**: Immediate (no monthly costs)
- **Revenue increase**: 20-30% from online spare parts sales
- **Time savings**: 5-10 hours/week (reduced phone inquiries)
- **Customer reach**: 3-5x more customers (online visibility)

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
