// Spare Parts Types
// Auto-generated from database schema

export interface SparePart {
  id: string;
  name: string;
  part_code: string | null;
  category: 'ac' | 'refrigerator';
  sub_category: string | null;
  brand: string | null;
  appliance_models: string[];
  price: number;
  bulk_price: number | null;
  bulk_min_quantity: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_available: boolean;
  primary_image_url: string | null;
  image_gallery: string[];
  description: string | null;
  specifications: Record<string, any>;
  warranty_months: number | null;
  is_genuine: boolean;
  slug: string;
  meta_description: string | null;
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
  discount_amount: number;
  status: OrderStatus;
  source: OrderSource;
  chat_conversation_id: string | null;
  whatsapp_conversation_started: boolean;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
}

export interface OrderItem {
  part_id: string;
  part_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
export type OrderSource = 'chat' | 'form' | 'whatsapp' | 'phone';
export type PartCategory = 'ac' | 'refrigerator';

// API Request/Response Types
export interface CreatePartData {
  name: string;
  part_code?: string;
  category: PartCategory;
  sub_category?: string;
  brand?: string;
  appliance_models?: string[];
  price: number;
  bulk_price?: number;
  bulk_min_quantity?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_available?: boolean;
  primary_image_url?: string;
  image_gallery?: string[];
  description?: string;
  specifications?: Record<string, any>;
  warranty_months?: number;
  is_genuine?: boolean;
  slug: string;
  meta_description?: string;
}

export interface UpdatePartData extends Partial<CreatePartData> {
  id: string;
}

export interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_location: string;
  items: {
    part_id: string;
    quantity: number;
  }[];
  source?: OrderSource;
  chat_conversation_id?: string;
  customer_notes?: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  admin_notes?: string;
  whatsapp_conversation_started?: boolean;
}

// Filter Types
export interface PartFilters {
  category?: PartCategory;
  brand?: string;
  sub_category?: string;
  search?: string;
  in_stock?: boolean;
  is_genuine?: boolean;
  min_price?: number;
  max_price?: number;
  sort?: 'name' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  customer_email?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// API Response Types
export interface PartsResponse {
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

export interface PartWithRelated {
  part: SparePart;
  related_parts: SparePart[];
}

export interface SearchResults {
  results: SparePart[];
  suggestions: string[];
  total: number;
}

export interface OrdersResponse {
  orders: BulkOrder[];
  total: number;
  page: number;
  pages: number;
  stats: {
    pending: number;
    confirmed: number;
    processing: number;
    delivered: number;
    cancelled: number;
    total_value: number;
  };
}

export interface CategoryInfo {
  id: PartCategory;
  name: string;
  count: number;
  subcategories: {
    id: string;
    name: string;
    count: number;
  }[];
}

export interface FeaturedParts {
  featured: SparePart[];
  popular: SparePart[];
  new_arrivals: SparePart[];
}

// Stock Status
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockInfo {
  status: StockStatus;
  quantity: number;
  threshold: number;
  message: string;
}

// Email Types
export interface BulkOrderEmailData {
  order: BulkOrder;
  items_with_details: Array<OrderItem & { part?: SparePart }>;
  whatsapp_link: string;
}

export interface OrderStatusEmailData {
  order: BulkOrder;
  old_status: OrderStatus;
  new_status: OrderStatus;
}

// Error Types
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

// Success Response
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}
