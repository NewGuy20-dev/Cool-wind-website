// Utility functions for Spare Parts feature
import type { SparePart, StockStatus, StockInfo } from './types';
import { STOCK_THRESHOLDS } from './constants';

/**
 * Generate URL-friendly slug from part name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculate price based on quantity (regular or bulk)
 */
export function calculatePrice(part: SparePart, quantity: number): number {
  if (part.bulk_price && quantity >= part.bulk_min_quantity) {
    return part.bulk_price * quantity;
  }
  return part.price * quantity;
}

/**
 * Calculate unit price based on quantity
 */
export function getUnitPrice(part: SparePart, quantity: number): number {
  if (part.bulk_price && quantity >= part.bulk_min_quantity) {
    return part.bulk_price;
  }
  return part.price;
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(part: SparePart, quantity: number): number {
  if (part.bulk_price && quantity >= part.bulk_min_quantity) {
    const regularTotal = part.price * quantity;
    const bulkTotal = part.bulk_price * quantity;
    return regularTotal - bulkTotal;
  }
  return 0;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(part: SparePart): number {
  if (!part.bulk_price) return 0;
  return Math.round(((part.price - part.bulk_price) / part.price) * 100);
}

/**
 * Format price as ₹X,XXX.XX
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format price with decimals
 */
export function formatPriceDetailed(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get stock status based on quantity and threshold
 */
export function getStockStatus(part: SparePart): StockStatus {
  if (part.stock_quantity <= STOCK_THRESHOLDS.OUT_OF_STOCK) {
    return 'out_of_stock';
  }
  if (part.stock_quantity <= part.low_stock_threshold) {
    return 'low_stock';
  }
  return 'in_stock';
}

/**
 * Get stock info with message
 */
export function getStockInfo(part: SparePart): StockInfo {
  const status = getStockStatus(part);
  let message = '';

  switch (status) {
    case 'out_of_stock':
      message = 'Out of stock';
      break;
    case 'low_stock':
      message = `Only ${part.stock_quantity} left!`;
      break;
    case 'in_stock':
      message = 'In stock';
      break;
  }

  return {
    status,
    quantity: part.stock_quantity,
    threshold: part.low_stock_threshold,
    message,
  };
}

/**
 * Generate unique order number: CW-YYYYMMDD-XXXX
 */
export function generateOrderNumber(counter: number = 1): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const counterStr = counter.toString().padStart(4, '0');
  return `CW-${dateStr}-${counterStr}`;
}

/**
 * Validate part code format
 */
export function validatePartCode(code: string): boolean {
  // Format: BRAND-TYPE-SPEC (e.g., LG-COMP-1.5T)
  const regex = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9.]+$/;
  return regex.test(code);
}

/**
 * Generate WhatsApp link with pre-filled message
 */
export function generateWhatsAppLink(message: string, phone: string = '918547229991'): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp link for bulk order
 */
export function generateBulkOrderWhatsAppLink(orderNumber: string, items: string[], total: number): string {
  const message = `
Order Confirmation - Cool Wind Services

Order ID: #${orderNumber}
Parts Requested:
${items.join('\n')}

Total Estimate: ${formatPrice(total)}

I'd like to discuss this order further.
  `.trim();

  return generateWhatsAppLink(message);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Get category display name
 */
export function getCategoryName(category: 'ac' | 'refrigerator'): string {
  return category === 'ac' ? 'AC Parts' : 'Refrigerator Parts';
}

/**
 * Get sub-category display name
 */
export function getSubCategoryName(subCategory: string): string {
  return subCategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if part qualifies for bulk pricing
 */
export function qualifiesForBulkPrice(part: SparePart, quantity: number): boolean {
  return !!part.bulk_price && quantity >= part.bulk_min_quantity;
}

/**
 * Get savings message
 */
export function getSavingsMessage(part: SparePart, quantity: number): string | null {
  if (!qualifiesForBulkPrice(part, quantity)) return null;
  
  const discount = calculateDiscount(part, quantity);
  const percentage = calculateDiscountPercentage(part);
  
  return `Save ${formatPrice(discount)} (${percentage}% off) with bulk pricing!`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone number format (Indian)
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^[+]?[0-9]{10,15}$/;
  return regex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return then.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get image URL or placeholder
 */
export function getImageUrl(url: string | null | undefined, placeholder: string = '/images/spare-parts/placeholder-part.jpg'): string {
  return url || placeholder;
}

/**
 * Check if image URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  } catch {
    return false;
  }
}
