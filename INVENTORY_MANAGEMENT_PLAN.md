# 📋 Enhanced Stocks & Inventory Management System - Implementation Plan

## 🎯 Overview
Enhance the existing spare parts inventory system at `/dashboard-wind-ops` with a comprehensive admin interface for managing products, stock levels, and inventory tracking that automatically updates customer-facing pages.

---

## 📊 Current System Analysis

### Existing Infrastructure:
- ✅ Database table: `spare_parts` with 20+ fields
- ✅ API routes: `/api/spare-parts` (GET, POST) and `/api/spare-parts/[id]` (GET, PUT, DELETE)
- ✅ Basic admin page: `/dashboard-wind-ops/spare-parts` with simple stock +/- buttons
- ✅ Public pages: `/spare-parts`, `/spare-parts/[slug]`, `/services/ac-spare-parts`, `/services/refrigerator-spare-parts`
- ✅ Types & validation: Comprehensive TypeScript types and Zod schemas
- ✅ Real-time stock tracking and low stock alerts

### Current Limitations:
- ❌ Placeholder add/edit modal ("Full form coming soon!")
- ❌ No image upload functionality
- ❌ No bulk operations (import/export)
- ❌ Basic stock adjustment (+1/-1 buttons only)
- ❌ No inventory history/audit trail
- ❌ No advanced filtering/search in admin panel
- ❌ No stock movement tracking

---

## 🏗️ Phase 1: Enhanced Product Management UI

### 1.1 Complete Add/Edit Product Form
**Location:** `/app/dashboard-wind-ops/spare-parts/components/ProductForm.tsx`

**Features:**
- Full form with all 20+ fields from database schema
- Multi-step wizard for better UX:
  - **Step 1:** Basic Info (name, part_code, category, sub_category, brand)
  - **Step 2:** Pricing (price, bulk_price, bulk_min_quantity)
  - **Step 3:** Stock (stock_quantity, low_stock_threshold, is_available)
  - **Step 4:** Images (primary_image_url, image_gallery) - **Using Supabase Storage**
  - **Step 5:** Details (description, specifications, warranty_months, is_genuine)
  - **Step 6:** SEO (slug, meta_description)
- Real-time validation with error messages
- Auto-generate slug from product name
- Specifications as dynamic key-value pairs
- Appliance models as tag input
- Image preview before save

### 1.2 Image Upload Integration
**Provider:** Supabase Storage

**Implementation:**
- Create storage bucket: `spare-parts-images`
- Drag-and-drop image upload
- Multiple image support for gallery
- Image optimization before upload
- Automatic URL generation
- Delete old images on update
- Public access URLs

### 1.3 Enhanced Product List View
**Features:**
- Advanced filters: category, brand, sub_category, stock status, availability
- Search: name, part_code, brand (full-text search)
- Sorting: name, price, stock, created_at
- Pagination with configurable page size
- Bulk actions: delete, toggle availability, export
- Quick edit inline for: stock_quantity, price, is_available
- Column customization (show/hide columns)

---

## 🔄 Phase 2: Advanced Stock Management

### 2.1 Stock Adjustment Modal
**Location:** `/app/dashboard-wind-ops/spare-parts/components/StockAdjustmentModal.tsx`

**Features:**
- Adjustment types:
  - **Manual count:** Set exact quantity
  - **Add stock:** Receive new inventory
  - **Remove stock:** Damage, theft, waste
  - **Transfer:** Move between locations (future)
- Reason/notes field (required for auditing)
- Confirmation step showing old vs new quantity
- Batch adjustment for multiple products

### 2.2 Inventory History & Audit Trail
**New Database Table:** `inventory_movements`
```sql
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES spare_parts(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) CHECK (movement_type IN ('add', 'remove', 'adjust', 'sale', 'return', 'damage', 'restock')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT,
  notes TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**UI:**
- View full history per product
- Global inventory movements log
- Export to CSV
- Filter by: date range, movement_type, admin, product

### 2.3 Low Stock Alerts & Reordering
**Features:**
- Dashboard widget showing low stock items
- Email notifications for critical stock levels
- Suggested reorder quantities based on sales velocity
- Mark products for reordering
- Generate purchase order reports

---

## 📈 Phase 3: Analytics & Reporting

### 3.1 Inventory Dashboard Widgets
**Components:**
- Total inventory value (sum of stock_quantity × price)
- Stock turnover rate
- Top selling products (from orders)
- Slow-moving inventory
- Category-wise breakdown
- Brand-wise breakdown
- Stock status pie chart (in stock, low stock, out of stock)

### 3.2 Reports
- Stock valuation report
- Inventory movement report (date range)
- Low stock report (exportable)
- Dead stock report (no sales in X days)
- Product performance report (sales, revenue)

---

## 💾 Phase 4: Bulk Operations

### 4.1 Import Products
**Format:** CSV/Excel
**Fields:** All product fields
**Features:**
- Template download
- Validation before import
- Preview before confirm
- Error reporting (row-by-row)
- Upsert logic (update if exists, create if not)

### 4.2 Export Products
**Formats:** CSV, Excel, JSON
**Filters:** Current filters applied
**Options:**
- All products or selected only
- Choose columns to export
- Include images (URLs)

---

## 🔗 Phase 5: Integration with Public Pages

### 5.1 Real-time Updates
**Implementation:**
- Supabase Realtime subscriptions (already configured)
- Auto-refresh product pages on stock change
- Show "X left in stock" message
- Disable "Order" button when out of stock
- Show "Notify me" option for out-of-stock items

### 5.2 Product Page Enhancements
**Updates to `/spare-parts/[slug]/page.tsx`:**
- Real-time stock indicator
- "Hurry! Only X left" for low stock
- "Out of stock" badge with "Notify me" form
- Related products based on category/brand
- Recently viewed products

---

## 🗂️ File Structure

```
app/
└── dashboard-wind-ops/
    └── spare-parts/
        ├── page.tsx (main list view - enhance)
        ├── components/
        │   ├── ProductForm.tsx (NEW - full CRUD form)
        │   ├── StockAdjustmentModal.tsx (NEW)
        │   ├── ImageUpload.tsx (NEW - Supabase Storage)
        │   ├── BulkImport.tsx (NEW)
        │   ├── InventoryStats.tsx (NEW)
        │   ├── MovementHistory.tsx (NEW)
        │   └── ProductFilters.tsx (NEW)
        └── [id]/
            └── page.tsx (NEW - detailed product view)

lib/
└── spare-parts/
    ├── types.ts (existing - update if needed)
    ├── validation.ts (existing - update for new schemas)
    ├── inventory.ts (NEW - inventory operations)
    └── storage.ts (NEW - Supabase Storage helpers)

api/
└── spare-parts/
    ├── upload/
    │   └── route.ts (NEW - image upload endpoint)
    └── inventory-movements/
        └── route.ts (NEW - movement history API)

sql/
└── migrations/
    └── 012_inventory_movements.sql (NEW)
```

---

## 🎨 UI/UX Improvements

### Design System:
- Use existing TailwindCSS + shadcn/ui components
- Consistent with dashboard design
- Responsive for mobile/tablet
- Keyboard shortcuts for power users

### Key Components:
- **Data table:** Sortable, filterable, with bulk actions
- **Modal forms:** Multi-step wizard for complex forms
- **Toast notifications:** Success/error feedback
- **Loading states:** Skeleton loaders
- **Empty states:** Helpful messages with actions

---

## 🔐 Security & Permissions

### Admin Authentication:
- Reuse existing admin key system: `x-admin-key` header
- Server-side validation on all mutations
- Row-level security (RLS) already configured
- Audit logging for all changes

### Supabase Storage Security:
- Bucket policies for authenticated upload
- Public read access for product images
- Admin-only delete permissions

---

## 📱 Responsive Design

- **Desktop:** Full feature set with data tables
- **Tablet:** Simplified table, cards for details
- **Mobile:** Card-based list, essential actions only

---

## ✅ Implementation Checklist

### Phase 1 (Core CRUD):
- [ ] Create components directory structure
- [ ] Build `ImageUpload.tsx` with Supabase Storage
- [ ] Create `ProductForm.tsx` component with full fields
- [ ] Add form validation with Zod
- [ ] Create API route for image upload
- [ ] Enhance list view with filters
- [ ] Add search functionality
- [ ] Implement delete confirmation
- [ ] Add detailed product view page

### Phase 2 (Stock Management):
- [ ] Create `inventory_movements` table via Supabase MCP
- [ ] Build `StockAdjustmentModal.tsx`
- [ ] Add audit trail API routes
- [ ] Create movement history view
- [ ] Implement low stock alerts
- [ ] Add email notifications

### Phase 3 (Analytics):
- [ ] Build dashboard widgets
- [ ] Create reports section
- [ ] Add export functionality
- [ ] Implement data visualization

### Phase 4 (Bulk Ops):
- [ ] CSV import feature
- [ ] Excel import support
- [ ] Multi-format export
- [ ] Template generation

### Phase 5 (Integration):
- [ ] Add Realtime subscriptions
- [ ] Update public product pages
- [ ] Test end-to-end flow
- [ ] Performance optimization

---

## 🚀 Implementation Order

1. **Phase 1:** Complete form + Image upload + Enhanced list (Core CRUD)
2. **Phase 2:** Stock adjustments + Audit trail + Alerts (Stock Management)
3. **Phase 3:** Analytics + Reports (Business Intelligence)
4. **Phase 4:** Bulk operations (Data Management)
5. **Phase 5:** Integration + Real-time updates (Public Pages)

---

## 📦 Dependencies to Add

```json
{
  "react-hook-form": "^7.x",  // Form management
  "react-dropzone": "^14.x",   // File upload
  "@tanstack/react-table": "^8.x",  // Advanced tables
  "recharts": "^2.x",          // Charts
  "papaparse": "^5.x",         // CSV parsing
  "xlsx": "^0.18.x",           // Excel support
  "date-fns": "^2.x",          // Date formatting
  "sonner": "^1.x"             // Toast notifications
}
```

---

## 🎯 Success Metrics

- ✅ Admin can add/edit/delete products in < 2 minutes
- ✅ Stock adjustments reflected on public pages immediately
- ✅ Zero data entry errors with validation
- ✅ 100% audit trail coverage
- ✅ Export/Import working for 100+ products
- ✅ Mobile-responsive dashboard

---

## 🔧 Technical Notes

### Supabase Storage Setup:
1. Create bucket: `spare-parts-images`
2. Enable public access for read
3. Set file size limits (5MB per image)
4. Allowed formats: jpg, jpeg, png, webp
5. Automatic path structure: `{category}/{part_id}/{filename}`

### API Endpoints:
- `POST /api/spare-parts/upload` - Upload images
- `GET/POST /api/spare-parts/inventory-movements` - Movement history
- `POST /api/spare-parts/bulk-import` - Import products
- `GET /api/spare-parts/export` - Export products

---

**Implementation Status:** Ready to begin
**Estimated Completion:** All phases
**Technology Stack:** Next.js 14, TypeScript, Supabase, TailwindCSS
