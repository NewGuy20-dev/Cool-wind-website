// Validation schemas using Zod
import { z } from 'zod';

// Part Category Schema
export const partCategorySchema = z.enum(['ac', 'refrigerator']);

// Order Status Schema
export const orderStatusSchema = z.enum(['pending', 'confirmed', 'processing', 'delivered', 'cancelled']);

// Order Source Schema
export const orderSourceSchema = z.enum(['chat', 'form', 'whatsapp', 'phone']);

// Spare Part Schema
export const sparePartSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  part_code: z.string().max(100).optional(),
  category: partCategorySchema,
  sub_category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  appliance_models: z.array(z.string()).optional().default([]),
  price: z.number().positive('Price must be positive'),
  bulk_price: z.number().positive().optional(),
  bulk_min_quantity: z.number().int().positive().optional().default(5),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative').default(0),
  low_stock_threshold: z.number().int().positive().default(5),
  is_available: z.boolean().default(true),
  primary_image_url: z.string().url().optional(),
  image_gallery: z.array(z.string().url()).optional().default([]),
  description: z.string().optional(),
  specifications: z.record(z.string(), z.any()).optional().default({}),
  warranty_months: z.number().int().positive().optional(),
  is_genuine: z.boolean().default(true),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  meta_description: z.string().max(160, 'Meta description must be 160 characters or less').optional(),
});

// Create Part Schema (for API)
export const createPartSchema = sparePartSchema;

// Update Part Schema (partial)
export const updatePartSchema = sparePartSchema.partial().extend({
  id: z.string().uuid(),
});

// Order Item Schema
export const orderItemSchema = z.object({
  part_id: z.string().uuid('Invalid part ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

// Create Order Schema
export const createOrderSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  customer_phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number format'),
  customer_email: z.string().email('Invalid email address'),
  delivery_location: z.string().min(2, 'Location required').default('Thiruvalla, Kerala'), // Default to shop location
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  source: orderSourceSchema.optional().default('form'),
  chat_conversation_id: z.string().uuid().optional(),
  customer_notes: z.string().optional(),
});

// Update Order Schema
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  admin_notes: z.string().optional(),
  whatsapp_conversation_started: z.boolean().optional(),
  archived: z.boolean().optional(),
});

// Filter Schemas
export const partFiltersSchema = z.object({
  category: partCategorySchema.optional(),
  brand: z.string().optional(),
  sub_category: z.string().optional(),
  search: z.string().optional(),
  in_stock: z.boolean().optional(),
  is_genuine: z.boolean().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  sort: z.enum(['name', 'price_asc', 'price_desc', 'newest']).optional().default('newest'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const orderFiltersSchema = z.object({
  status: orderStatusSchema.optional(),
  customer_email: z.string().email().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    category: partCategorySchema.optional(),
    brand: z.string().optional(),
  }).optional(),
  limit: z.number().int().positive().max(50).optional().default(10),
});

// Validation Helper Functions
export function validatePartData(data: unknown) {
  return sparePartSchema.safeParse(data);
}

export function validateOrderData(data: unknown) {
  return createOrderSchema.safeParse(data);
}

export function validateFilters(data: unknown) {
  return partFiltersSchema.safeParse(data);
}

// Type exports from schemas
export type ValidatedPart = z.infer<typeof sparePartSchema>;
export type ValidatedOrder = z.infer<typeof createOrderSchema>;
export type ValidatedFilters = z.infer<typeof partFiltersSchema>;
