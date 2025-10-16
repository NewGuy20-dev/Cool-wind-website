// Email Templates for Spare Parts Orders
import type { BulkOrderEmailData, OrderStatusEmailData } from '@/lib/spare-parts/types';
import type { EmailTemplate } from './types';
import { formatPrice, formatDateTime } from '@/lib/spare-parts/utils';
import { ORDER_STATUS_LABELS } from '@/lib/spare-parts/constants';

// Helper function to get status emoji
function getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
        'confirmed': '✅',
        'processing': '⚙️',
        'delivered': '🎉',
        'cancelled': '❌'
    };
    return emojiMap[status] || '📋';
}

export function bulkOrderCustomerEmail(data: BulkOrderEmailData): EmailTemplate {
    const { order, items_with_details, whatsapp_link } = data;

    const subject = `✅ Order Confirmed #${order.order_number} | Cool Wind Services`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a202c; background: #f5f7fa; margin: 0; padding: 0; }
    .email-wrapper { background: #f5f7fa; padding: 30px 20px; }
    .container { max-width: 680px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; padding: 48px 40px; text-align: center; position: relative; }
    .header-content { position: relative; z-index: 1; }
    .logo-img { width: 64px; height: 64px; margin: 0 auto 20px; display: block; }
    .header h1 { font-size: 36px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
    .header p { font-size: 18px; opacity: 0.95; font-weight: 500; }
    .content { padding: 40px; background: white; }
    .order-number-box { text-align: center; margin-bottom: 32px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 2px dashed #cbd5e0; }
    .order-number { display: inline-block; background: #0066cc; color: white; padding: 12px 28px; border-radius: 6px; font-size: 20px; font-weight: 700; letter-spacing: 0.3px; }
    .greeting { font-size: 17px; color: #4b5563; margin-bottom: 32px; line-height: 1.8; padding: 20px; background: #f9fafb; border-left: 4px solid #0066cc; border-radius: 4px; }
    .greeting strong { color: #111827; font-weight: 600; }
    .section-title { font-size: 22px; font-weight: 700; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 10px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .items-table thead { background: #f8fafc; }
    .items-table th { padding: 14px 16px; text-align: left; font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
    .items-table td { padding: 16px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 15px; }
    .items-table tbody tr:last-child td { border-bottom: none; }
    .items-table tbody tr:hover { background: #f9fafb; }
    .part-name { font-weight: 600; color: #111827; font-size: 16px; margin-bottom: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
    .badge-success { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .badge-info { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .item-price { font-weight: 600; color: #0066cc; font-size: 15px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .summary-box { background: #f8fafc; padding: 24px; border-radius: 8px; margin: 28px 0; border: 2px solid #e5e7eb; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; color: #4b5563; }
    .summary-row strong { color: #111827; font-weight: 700; }
    .summary-row.total { border-top: 2px solid #d1d5db; margin-top: 12px; padding-top: 16px; font-size: 22px; font-weight: 700; color: #0066cc; }
    .discount-badge { background: #dcfce7; color: #15803d; padding: 16px 24px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 16px; margin: 20px 0; border: 1px solid #86efac; }
    .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 24px 0; border: 1px solid #fcd34d; }
    .info-box strong { color: #92400e; display: block; margin-bottom: 8px; font-size: 17px; font-weight: 700; }
    .info-box p { color: #78350f; font-size: 15px; margin: 0; line-height: 1.7; }
    .location-box { background: #eff6ff; padding: 28px; border-radius: 8px; margin: 32px 0; text-align: center; border: 1px solid #bfdbfe; }
    .location-box h3 { color: #1e40af; margin-bottom: 16px; font-size: 20px; font-weight: 700; }
    .location-details { background: white; padding: 20px; border-radius: 6px; margin: 16px 0; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e0e7ff; }
    .location-details strong { color: #0066cc; font-size: 17px; display: block; margin-bottom: 10px; font-weight: 700; }
    .button-group { margin: 20px 0; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .button { display: inline-block; padding: 16px 32px; background: #25D366; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(37,211,102,0.3); }
    .button:hover { background: #20BA5A; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37,211,102,0.4); }
    .button-maps { background: #4285F4; box-shadow: 0 4px 12px rgba(66,133,244,0.3); }
    .button-maps:hover { background: #357ae8; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(66,133,244,0.4); }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 28px 0; }
    .contact-card { background: #f9fafb; padding: 20px; border-radius: 6px; text-align: center; border: 1px solid #e5e7eb; transition: all 0.2s ease; }
    .contact-card:hover { background: #f3f4f6; border-color: #0066cc; }
    .contact-card strong { display: block; color: #6b7280; margin-bottom: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .contact-card a { color: #111827; text-decoration: none; font-weight: 700; font-size: 16px; }
    .footer { background: #1f2937; color: #9ca3af; padding: 32px; text-align: center; font-size: 13px; }
    .footer-brand { color: white; font-weight: 700; font-size: 18px; margin-bottom: 8px; }
    .footer-tagline { color: #d1d5db; font-size: 14px; margin: 8px 0; }
    .footer-links { margin: 20px 0; }
    .footer-links a { color: #60a5fa; text-decoration: none; margin: 0 12px; font-weight: 500; transition: color 0.2s ease; }
    .footer-links a:hover { color: #93c5fd; }
    .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 15px 10px; }
      .content { padding: 24px 20px; }
      .header { padding: 32px 20px; }
      .contact-grid { grid-template-columns: 1fr; }
      .button-group { flex-direction: column; }
      .button { width: 100%; }
      .items-table { font-size: 13px; }
      .items-table th, .items-table td { padding: 12px 8px; }
      .section-title { font-size: 18px; }
      .header h1 { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="header-content">
          <img src="https://coolwind.co.in/logo.png" alt="Cool Wind Services" style="width: 64px; height: 64px; margin: 0 auto 20px; display: block;">
          <h1>Order Confirmed!</h1>
          <p>Thank you for choosing Cool Wind Services</p>
        </div>
      </div>
      
      <div class="content">
        <div class="order-number-box">
          <div class="order-number">ORDER #${order.order_number}</div>
        </div>
        
        <p class="greeting">Hi <strong>${order.customer_name}</strong>, your bulk order has been confirmed and our team is preparing your spare parts!</p>
        
        <h3 class="section-title">📦 Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item Details</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
          ${items_with_details.map(item => `
            <tr>
              <td>
                <div class="part-name">${item.part_name}</div>
                ${item.part?.is_genuine ? '<span class="badge badge-success">✓ Genuine</span>' : ''}
                ${item.part?.warranty_months ? `<span class="badge badge-info">${item.part.warranty_months}M Warranty</span>` : ''}
              </td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${formatPrice(item.unit_price)}</td>
              <td class="text-right item-price">${formatPrice(item.total_price)}</td>
            </tr>
          `).join('')}
          </tbody>
        </table>
        
        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal</span>
            <strong>${formatPrice(order.total_amount + (order.discount_amount || 0))}</strong>
          </div>
          ${order.bulk_discount_applied ? `
          <div class="summary-row" style="color: #48bb78;">
            <span>Bulk Discount</span>
            <strong>-${formatPrice(order.discount_amount)}</strong>
          </div>
          ` : ''}
          <div class="summary-row total">
            <span>Total Amount</span>
            <span>${formatPrice(order.total_amount)}</span>
          </div>
        </div>
        
        ${order.bulk_discount_applied ? `
        <div class="discount-badge">
          🎉 You saved ${formatPrice(order.discount_amount)} with bulk discount!
        </div>
        ` : ''}
        
        <div class="info-box">
          <strong>📦 Ready for Pickup</strong>
          <p>Your order will be ready within 2-4 hours at our shop. We'll notify you once it's prepared!</p>
        </div>
        
        <div class="divider"></div>
        
        <div class="location-box">
          <h3>📍 Pickup Location</h3>
          <div class="location-details">
            <strong>Cool Wind Services</strong>
            <p style="margin: 8px 0; color: #4a5568; line-height: 1.6;">
              Pushpagiri Hospitals Rd<br>
              Thiruvalla, Kerala 689101
            </p>
          </div>
          <div class="button-group">
            <a href="https://maps.app.goo.gl/b1wBEZ33KdnRGb8d8" class="button button-maps">
              📍 Open in Google Maps
            </a>
            <a href="${whatsapp_link}" class="button">
              💬 Continue on WhatsApp
            </a>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <h3 class="section-title">📞 Need Assistance?</h3>
        <div class="contact-grid">
          <div class="contact-card">
            <strong>📞 Call Us</strong>
            <a href="tel:+918547229991">+91 85472 29991</a>
          </div>
          <div class="contact-card">
            <strong>📧 Email Us</strong>
            <a href="mailto:info@coolwind.co.in">info@coolwind.co.in</a>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-brand">Cool Wind Services</div>
        <p class="footer-tagline">15+ Years of Trusted Service in Thiruvalla</p>
        <p style="margin: 12px 0; color: #cbd5e0;">AC & Refrigerator Repair | Genuine Spare Parts | Bulk Orders</p>
        <div class="footer-links">
          <a href="https://coolwind.co.in">Visit Website</a>
          <a href="https://coolwind.co.in/spare-parts">Browse Parts</a>
          <a href="https://coolwind.co.in/services">Our Services</a>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #718096;">
          © ${new Date().getFullYear()} Cool Wind Services. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

    const text = `
Order Confirmation - ${order.order_number}

Thank you for your order, ${order.customer_name}!

Items Requested:
${items_with_details.map(item =>
        `- ${item.part_name}\n  Quantity: ${item.quantity} × ${formatPrice(item.unit_price)} = ${formatPrice(item.total_price)}`
    ).join('\n')}

Total Estimate: ${formatPrice(order.total_amount)}
${order.bulk_discount_applied ? `Bulk discount applied! You saved ${formatPrice(order.discount_amount)}` : ''}

Delivery Location: ${order.delivery_location}

📦 PICKUP INSTRUCTIONS:
Your order will be ready for pickup within 2-4 hours.

Pickup Location:
Cool Wind Services
Pushpagiri Hospitals Rd
Thiruvalla, Kerala 689101

Google Maps: https://maps.app.goo.gl/b1wBEZ33KdnRGb8d8
Plus Code: 9HMH+J3 Thiruvalla, Kerala

Continue on WhatsApp: ${whatsapp_link}

Need immediate assistance?
Call: +91 85472 29991
Email: info@coolwind.co.in

Cool Wind Services | Thiruvalla, Kerala
15+ Years of Trusted Service
  `.trim();

    return { subject, html, text };
}

export function bulkOrderAdminEmail(data: BulkOrderEmailData): EmailTemplate {
    const { order, items_with_details } = data;

    const subject = `🚨 NEW ORDER #${order.order_number} - Action Required!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a202c; background: #f7fafc; }
    .email-wrapper { background: #f7fafc; padding: 30px 15px; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
    .urgent-banner { background: linear-gradient(135deg, #f56565 0%, #c53030 100%); color: white; padding: 6px; text-align: center; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
    .header { background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }
    .header h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .order-badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 10px 20px; border-radius: 20px; font-size: 20px; font-weight: 700; margin-top: 12px; backdrop-filter: blur(10px); }
    .content { padding: 35px 30px; }
    .priority-box { background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); border: 3px solid #fc8181; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
    .priority-box strong { color: #c53030; font-size: 20px; display: block; margin-bottom: 8px; font-weight: 700; }
    .priority-box p { color: #742a2a; margin: 0; font-weight: 600; font-size: 16px; }
    .section-title { font-size: 22px; font-weight: 800; color: #2d3748; margin: 30px 0 16px 0; padding-bottom: 8px; border-bottom: 3px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
    .customer-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; padding: 24px; border-radius: 12px; margin: 20px 0; }
    .customer-card h3 { color: #92400e; margin: 0 0 16px 0; font-size: 18px; }
    .info-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(146,64,14,0.1); }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 700; color: #92400e; min-width: 100px; font-size: 15px; }
    .info-value { color: #78350f; flex: 1; font-size: 15px; }
    .info-value a { color: #0066cc; text-decoration: none; font-weight: 700; }
    .info-value a:hover { text-decoration: underline; }
    .items-box { background: #f7fafc; border: 2px solid #cbd5e0; padding: 24px; border-radius: 12px; margin: 20px 0; }
    .items-box h3 { color: #2d3748; margin: 0 0 20px 0; font-size: 18px; }
    .item-row { background: white; padding: 16px; margin-bottom: 12px; border-radius: 8px; border-left: 4px solid #dc3545; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .item-name { font-weight: 700; font-size: 17px; color: #2d3748; margin-bottom: 8px; }
    .item-meta { font-size: 15px; color: #718096; line-height: 1.8; }
    .item-meta strong { color: #2d3748; }
    .stock-badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 12px; font-weight: 700; margin-left: 8px; }
    .total-box { background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); color: white; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center; }
    .total-label { font-size: 15px; opacity: 0.8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .total-amount { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
    .discount-text { color: #68d391; font-size: 14px; font-weight: 600; }
    .notes-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .notes-box strong { color: #92400e; display: block; margin-bottom: 10px; font-size: 17px; font-weight: 700; }
    .notes-box p { color: #78350f; margin: 0; font-size: 15px; line-height: 1.7; }
    .action-buttons { display: flex; gap: 14px; flex-wrap: wrap; margin: 30px 0; justify-content: center; }
    .btn { display: inline-block; padding: 18px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 17px; text-align: center; transition: all 0.3s ease; flex: 1; min-width: 160px; }
    .btn-primary { background: linear-gradient(135deg, #0066cc 0%, #004c99 100%); color: white; box-shadow: 0 4px 12px rgba(0,102,204,0.4); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,102,204,0.5); }
    .btn-success { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; box-shadow: 0 4px 12px rgba(72,187,120,0.4); }
    .btn-success:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(72,187,120,0.5); }
    .btn-whatsapp { background: linear-gradient(135deg, #25D366 0%, #20BA5A 100%); color: white; box-shadow: 0 4px 12px rgba(37,211,102,0.4); }
    .btn-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37,211,102,0.5); }
    .timestamp { background: #edf2f7; padding: 16px; border-radius: 8px; text-align: center; color: #4a5568; font-size: 15px; margin-top: 30px; }
    .timestamp strong { color: #2d3748; font-weight: 700; }
    .footer { background: #1a202c; color: #a0aec0; padding: 24px; text-align: center; font-size: 13px; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 15px 10px; }
      .content { padding: 24px 20px; }
      .action-buttons { flex-direction: column; }
      .btn { min-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="urgent-banner">⚡ NEW ORDER - IMMEDIATE ACTION REQUIRED ⚡</div>
      
      <div class="header">
        <img src="https://coolwind.co.in/logo.png" alt="Cool Wind Services" style="width: 64px; height: 64px; margin: 0 auto 20px; display: block;">
        <h1>New Bulk Order Received</h1>
        <div class="order-badge">ORDER #${order.order_number}</div>
      </div>
      
      <div class="content">
        <div class="priority-box">
          <strong>⏰ HIGH PRIORITY ORDER</strong>
          <p>Customer is waiting for confirmation - Respond within 2-4 hours</p>
        </div>
        
        <div class="section-title">
          👤 Customer Information
        </div>
        <div class="customer-card">
          <h3>Contact Details</h3>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value"><strong>${order.customer_name}</strong></span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value"><a href="tel:${order.customer_phone}">${order.customer_phone}</a></span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value"><a href="mailto:${order.customer_email}">${order.customer_email}</a></span>
          </div>
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">${order.delivery_location}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Source:</span>
            <span class="info-value"><strong>${order.source}</strong></span>
          </div>
        </div>
        
        <div class="section-title">
          📦 Order Items
        </div>
        <div class="items-box">
          <h3>Parts Requested (${items_with_details.length} items)</h3>
          ${items_with_details.map(item => `
          <div class="item-row">
            <div class="item-name">${item.part_name}</div>
            <div class="item-meta">
              <strong>Quantity:</strong> ${item.quantity} units × ${formatPrice(item.unit_price)} = <strong style="color: #dc3545; font-size: 16px;">${formatPrice(item.total_price)}</strong>
              ${item.part ? `<span class="stock-badge">📦 Stock: ${item.part.stock_quantity} units</span>` : '<span class="stock-badge" style="background: #fee; color: #c53030;">⚠️ Check Stock</span>'}
            </div>
          </div>
          `).join('')}
        </div>
        
        <div class="total-box">
          <div class="total-label">Order Total</div>
          <div class="total-amount">${formatPrice(order.total_amount)}</div>
          ${order.bulk_discount_applied ? `<div class="discount-text">✓ Bulk discount applied: ${formatPrice(order.discount_amount)} saved</div>` : ''}
        </div>
        
        ${order.customer_notes ? `
        <div class="section-title">
          📝 Customer Notes
        </div>
        <div class="notes-box">
          <strong>Special Instructions:</strong>
          <p>${order.customer_notes}</p>
        </div>
        ` : ''}
        
        <div class="section-title">
          ⚡ Quick Actions
        </div>
        <div class="action-buttons">
          <a href="https://coolwind.co.in/dashboard-wind-ops/orders" class="btn btn-primary">
            📊 View in Dashboard
          </a>
          <a href="tel:${order.customer_phone}" class="btn btn-success">
            📞 Call Customer
          </a>
          <a href="https://wa.me/${order.customer_phone.replace(/\D/g, '')}" class="btn btn-whatsapp">
            💬 WhatsApp
          </a>
        </div>
        
        <div class="timestamp">
          <strong>Order Received:</strong> ${formatDateTime(order.created_at)}
        </div>
      </div>
      
      <div class="footer">
        <p>Cool Wind Services - Admin Dashboard</p>
        <p style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
          This is an automated notification. Please respond to the customer promptly.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

    const text = `
New Bulk Order - ${order.order_number}

Customer Details:
- Name: ${order.customer_name}
- Phone: ${order.customer_phone}
- Email: ${order.customer_email}
- Location: ${order.delivery_location}

Order Items:
${items_with_details.map(item =>
        `- ${item.part_name}: ${item.quantity} × ${formatPrice(item.unit_price)} = ${formatPrice(item.total_price)}`
    ).join('\n')}

Total: ${formatPrice(order.total_amount)}
${order.bulk_discount_applied ? `Bulk discount: ${formatPrice(order.discount_amount)}` : ''}

${order.customer_notes ? `Customer Notes: ${order.customer_notes}` : ''}

View in Dashboard: https://coolwind.co.in/dashboard-wind-ops/orders
Call Customer: ${order.customer_phone}

Order received at ${formatDateTime(order.created_at)}
  `.trim();

    return { subject, html, text };
}

export function orderStatusUpdateEmail(data: OrderStatusEmailData): EmailTemplate {
    const { order, new_status } = data;

    const statusLabel = ORDER_STATUS_LABELS[new_status];
    const subject = `${getStatusEmoji(new_status)} Order #${order.order_number} - ${statusLabel}`;

    let statusMessage = '';
    let statusColor = '#0066cc';
    let statusIcon = '📋';
    let statusGradient = 'linear-gradient(135deg, #0066cc 0%, #004c99 100%)';

    switch (new_status) {
        case 'confirmed':
            statusMessage = 'Great news! Your order has been confirmed and we are now preparing your spare parts.';
            statusColor = '#0066cc';
            statusIcon = '✅';
            statusGradient = 'linear-gradient(135deg, #0066cc 0%, #004c99 100%)';
            break;
        case 'processing':
            statusMessage = 'Your order is currently being processed. Our team is working on it and it will be ready soon!';
            statusColor = '#9c27b0';
            statusIcon = '⚙️';
            statusGradient = 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)';
            break;
        case 'delivered':
            statusMessage = 'Your order has been successfully delivered! Thank you for choosing Cool Wind Services.';
            statusColor = '#28a745';
            statusIcon = '🎉';
            statusGradient = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
            break;
        case 'cancelled':
            statusMessage = 'Your order has been cancelled. If you have any questions or concerns, please don\'t hesitate to contact us.';
            statusColor = '#dc3545';
            statusIcon = '❌';
            statusGradient = 'linear-gradient(135deg, #dc3545 0%, #c53030 100%)';
            break;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a202c; background: #f5f7fa; }
    .email-wrapper { background: #f5f7fa; padding: 30px 20px; }
    .container { max-width: 680px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
    .header { background: ${statusGradient}; color: white; padding: 48px 40px; text-align: center; position: relative; }
    .header h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
    .order-number { background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; font-size: 16px; font-weight: 600; display: inline-block; margin-top: 8px; }
    .content { padding: 40px; background: white; }
    .status-banner { background: ${statusGradient}; color: white; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 32px; }
    .status-banner h2 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .status-banner p { font-size: 17px; opacity: 0.95; line-height: 1.7; }
    .info-section { background: #f8fafc; padding: 24px; border-radius: 8px; margin: 28px 0; border: 2px solid #e5e7eb; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 500; color: #6b7280; font-size: 15px; }
    .info-value { font-weight: 600; color: #111827; font-size: 16px; }
    .notes-section { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 24px 0; border: 1px solid #fcd34d; }
    .notes-section strong { color: #92400e; display: block; margin-bottom: 10px; font-size: 17px; font-weight: 700; }
    .notes-section p { color: #78350f; font-size: 15px; line-height: 1.7; margin: 0; }
    .contact-section { background: #eff6ff; padding: 28px; border-radius: 8px; text-align: center; margin: 32px 0; border: 1px solid #bfdbfe; }
    .contact-section h3 { color: #1e40af; font-size: 20px; margin-bottom: 12px; font-weight: 700; }
    .contact-section p { color: #1e3a8a; font-size: 16px; margin: 10px 0; }
    .contact-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .btn-phone { background: #22c55e; color: white; }
    .btn-phone:hover { background: #16a34a; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(34,197,94,0.3); }
    .btn-email { background: #3b82f6; color: white; }
    .btn-email:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59,130,246,0.3); }
    .footer { background: #1f2937; color: #9ca3af; padding: 32px; text-align: center; font-size: 13px; }
    .footer-brand { color: white; font-weight: 700; font-size: 18px; margin-bottom: 8px; }
    .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 15px 10px; }
      .content { padding: 24px 20px; }
      .header { padding: 32px 20px; }
      .contact-buttons { flex-direction: column; }
      .btn { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <img src="https://coolwind.co.in/logo.png" alt="Cool Wind Services" style="width: 64px; height: 64px; margin: 0 auto 20px; display: block;">
        <h1>Order Status Update</h1>
        <div class="order-number">ORDER #${order.order_number}</div>
      </div>
      
      <div class="content">
        <div class="status-banner">
          <h2>${statusLabel}</h2>
          <p>${statusMessage}</p>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Customer Name</span>
            <span class="info-value">${order.customer_name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Order Number</span>
            <span class="info-value">#${order.order_number}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Amount</span>
            <span class="info-value" style="color: ${statusColor}; font-size: 18px;">${formatPrice(order.total_amount)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color: ${statusColor};">${statusLabel}</span>
          </div>
        </div>
        
        ${order.admin_notes ? `
        <div class="divider"></div>
        <div class="notes-section">
          <strong>📝 Note from Cool Wind Services</strong>
          <p>${order.admin_notes}</p>
        </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <div class="contact-section">
          <h3>Need Help?</h3>
          <p>Our team is here to assist you with any questions or concerns.</p>
          <div class="contact-buttons">
            <a href="tel:+918547229991" class="btn btn-phone">
              📞 Call Us
            </a>
            <a href="mailto:info@coolwind.co.in" class="btn btn-email">
              📧 Email Us
            </a>
          </div>
          <p style="margin-top: 16px; font-size: 14px; color: #475569;">
            <strong>Phone:</strong> +91 85472 29991<br>
            <strong>Email:</strong> info@coolwind.co.in
          </p>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-brand">Cool Wind Services</div>
        <p style="margin: 8px 0; color: #d1d5db;">15+ Years of Trusted Service in Thiruvalla</p>
        <p style="margin: 12px 0; color: #cbd5e0;">AC & Refrigerator Repair | Genuine Spare Parts</p>
        <p style="margin-top: 24px; font-size: 12px; color: #718096;">
          © ${new Date().getFullYear()} Cool Wind Services. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

    const text = `
Order Status Update - ${order.order_number}

Status: ${statusLabel}
${statusMessage}

Customer: ${order.customer_name}
Total Amount: ${formatPrice(order.total_amount)}

${order.admin_notes ? `Note: ${order.admin_notes}` : ''}

Need help? Contact us:
Phone: +91 85472 29991
Email: info@coolwind.co.in
  `.trim();

    return { subject, html, text };
}
