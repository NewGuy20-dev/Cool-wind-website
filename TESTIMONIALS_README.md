# Testimonials & Reviews System

A complete system for managing customer testimonials and reviews with database storage, moderation, and public submission.

## Features

### 1. Database Schema
- **Table**: `testimonials`
- **Fields**:
  - Customer information (name, location, phone, email)
  - Review content (text, rating 1-5)
  - Service details (type, details, date)
  - Status management (pending, approved, rejected, archived)
  - Featured flags (is_featured, display_on_homepage)
  - Timestamps and metadata

### 2. API Endpoints

#### GET /api/testimonials
Fetch testimonials with filtering options:
- `?status=approved` - Filter by status (pending, approved, rejected, all)
- `?limit=10` - Limit results
- `?featured=true` - Only featured testimonials
- `?homepage=true` - Only homepage testimonials

#### POST /api/testimonials
Submit a new testimonial (public endpoint):
```json
{
  "customer_name": "John Doe",
  "location": "Thiruvalla",
  "phone_number": "1234567890",
  "email": "john@example.com",
  "review_text": "Excellent service!",
  "rating": 5,
  "service_type": "AC Repair",
  "service_details": "1.5 ton split AC gas charging",
  "service_date": "2024-01-15"
}
```

#### PATCH /api/testimonials/[id]
Update a testimonial (admin only):
```json
{
  "status": "approved",
  "is_featured": true,
  "display_on_homepage": true
}
```

#### DELETE /api/testimonials/[id]
Delete a testimonial (admin only)

### 3. Pages

#### /testimonials
Public testimonials page with:
- Filter by service type
- Filter by rating
- Display approved testimonials
- Link to add new testimonial

#### /testimonials/add
Public submission form for customers to add reviews:
- Customer information
- Service details
- Rating selector
- Review text (minimum 10 characters)
- Success confirmation

#### /dashboard-wind-ops/testimonials
Admin dashboard to manage testimonials:
- View all testimonials (pending, approved, rejected)
- Approve/reject pending testimonials
- Toggle featured status
- Toggle homepage display
- Delete testimonials
- Filter by status

### 4. Database Functions

#### approve_testimonial(testimonial_id, approver_id)
Approve a testimonial and set approval timestamp

#### get_featured_testimonials(limit_count)
Get featured testimonials for homepage display

### 5. Row Level Security (RLS)

- **Public**: Can view approved testimonials and submit new ones
- **Authenticated**: Can manage all testimonials (admin access)

## Usage

### For Customers
1. Visit `/testimonials/add`
2. Fill out the form with your experience
3. Submit for review
4. Testimonial will appear after admin approval

### For Admins
1. Visit `/dashboard-wind-ops/testimonials`
2. Review pending testimonials
3. Approve or reject submissions
4. Feature important testimonials
5. Toggle homepage display

## Migration

The database schema is in `sql/08_testimonials_schema.sql` and has been applied to the database.

Existing testimonials from the code have been migrated to the database.

## Integration

The testimonials system integrates with:
- Homepage carousel (featured testimonials)
- Services page (service-specific testimonials)
- Contact page (social proof)

## Security

- All submissions start as "pending" status
- Admin approval required before public display
- RLS policies enforce access control
- Input validation on all fields
- SQL injection protection via parameterized queries

## Future Enhancements

- Email notifications for new submissions
- Photo uploads with testimonials
- Reply to testimonials
- Testimonial analytics
- Export testimonials to CSV
- Bulk actions (approve multiple, delete multiple)
- Testimonial widgets for embedding
