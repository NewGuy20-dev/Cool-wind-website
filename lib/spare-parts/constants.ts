// Constants for Spare Parts Feature

export const CATEGORIES = [
  { id: 'ac' as const, name: 'AC Parts', icon: '❄️', description: 'Air Conditioner spare parts' },
  { id: 'refrigerator' as const, name: 'Refrigerator Parts', icon: '🧊', description: 'Refrigerator spare parts' },
];

export const SUB_CATEGORIES = {
  ac: [
    { id: 'compressors', name: 'Compressors' },
    { id: 'filters', name: 'Filters' },
    { id: 'thermostats', name: 'Thermostats' },
    { id: 'capacitors', name: 'Capacitors' },
    { id: 'fan-motors', name: 'Fan Motors' },
    { id: 'remote-controls', name: 'Remote Controls' },
    { id: 'pcb-boards', name: 'PCB Boards' },
    { id: 'sensors', name: 'Sensors' },
    { id: 'gas-charging', name: 'Gas & Charging' },
    { id: 'coils', name: 'Coils' },
  ],
  refrigerator: [
    { id: 'compressors', name: 'Compressors' },
    { id: 'door-seals', name: 'Door Seals' },
    { id: 'thermostats', name: 'Thermostats' },
    { id: 'defrost-timers', name: 'Defrost Timers' },
    { id: 'fan-motors', name: 'Fan Motors' },
    { id: 'shelves', name: 'Shelves & Racks' },
    { id: 'ice-makers', name: 'Ice Makers' },
    { id: 'water-filters', name: 'Water Filters' },
    { id: 'door-handles', name: 'Door Handles' },
    { id: 'lights', name: 'Lights' },
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
  'Panasonic',
  'O General',
  'Lloyd',
  'Videocon',
  'IFB',
  'Bosch',
  'Universal',
] as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

export const ORDER_STATUS_COLORS = {
  pending: 'yellow',
  confirmed: 'blue',
  processing: 'purple',
  delivered: 'green',
  cancelled: 'red',
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
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const;

export const PLACEHOLDER_IMAGES = {
  PART: '/images/spare-parts/placeholder-part.jpg',
  COMPRESSOR: '/images/spare-parts/placeholder-compressor.jpg',
  FILTER: '/images/spare-parts/placeholder-filter.jpg',
  REMOTE: '/images/spare-parts/placeholder-remote.jpg',
  SEAL: '/images/spare-parts/placeholder-seal.jpg',
  MOTOR: '/images/spare-parts/placeholder-motor.jpg',
} as const;

export const WHATSAPP_NUMBER = '918547229991';
export const BUSINESS_PHONE = '+918547229991';
export const BUSINESS_EMAIL = 'info@coolwind.co.in';

export const SHOP_ADDRESS = {
  street: 'Pushpagiri Hospitals Rd',
  city: 'Thiruvalla',
  state: 'Kerala',
  pincode: '689101',
  plusCode: '9HMH+J3 Thiruvalla, Kerala',
  mapsUrl: 'https://maps.google.com/?q=9HMH+J3+Thiruvalla,+Kerala',
  fullAddress: 'Pushpagiri Hospitals Rd, Thiruvalla, Kerala 689101',
} as const;

export const ROUTES = {
  CATALOG: '/spare-parts',
  PART_DETAIL: (slug: string) => `/spare-parts/${slug}`,
  ADMIN_PARTS: '/dashboard-wind-ops/spare-parts',
  ADMIN_ORDERS: '/dashboard-wind-ops/orders',
} as const;

export const API_ROUTES = {
  PARTS: '/api/spare-parts',
  PART_BY_ID: (id: string) => `/api/spare-parts/${id}`,
  SEARCH: '/api/spare-parts/search',
  CATEGORIES: '/api/spare-parts/categories',
  FEATURED: '/api/spare-parts/featured',
  ORDERS: '/api/spare-parts/orders',
  ORDER_BY_ID: (id: string) => `/api/spare-parts/orders/${id}`,
} as const;

// SEO Constants
export const SEO = {
  CATALOG_TITLE: 'Spare Parts - AC & Refrigerator Parts | Cool Wind Services',
  CATALOG_DESCRIPTION: 'Buy genuine AC and refrigerator spare parts in Kerala. Bulk discounts available. Fast delivery in Thiruvalla, Pathanamthitta, and nearby areas.',
  PART_TITLE_TEMPLATE: (partName: string) => `${partName} | Cool Wind Services`,
} as const;

// Email Templates
export const EMAIL_SUBJECTS = {
  ORDER_CONFIRMATION: (orderNumber: string) => `Order Confirmation - ${orderNumber} | Cool Wind Services`,
  ORDER_STATUS_UPDATE: (orderNumber: string, status: string) => `Order ${orderNumber} - ${status} | Cool Wind Services`,
  LOW_STOCK_ALERT: 'Low Stock Alert - Spare Parts',
} as const;
