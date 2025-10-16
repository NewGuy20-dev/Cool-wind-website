// Email sending functions using Brevo API directly
import axios from 'axios';
import { bulkOrderCustomerEmail, bulkOrderAdminEmail, orderStatusUpdateEmail } from './templates';
import type { EmailResult } from './types';
import type { BulkOrderEmailData, OrderStatusEmailData } from '@/lib/spare-parts/types';

const BUSINESS_NAME = 'Cool Wind Services';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Get environment variables dynamically (not at module load time)
 */
function getConfig() {
    return {
        apiKey: process.env.BREVO_API_KEY || '',
        businessEmail: process.env.BUSINESS_EMAIL || 'info@coolwind.co.in'
    };
}

/**
 * Send email via Brevo API
 */
async function sendEmail(payload: any) {
    const config = getConfig();

    if (!config.apiKey) {
        throw new Error('BREVO_API_KEY is not set in environment variables');
    }

    const response = await axios.post(BREVO_API_URL, payload, {
        headers: {
            'accept': 'application/json',
            'api-key': config.apiKey,
            'content-type': 'application/json'
        }
    });
    return response.data;
}

/**
 * Send bulk order confirmation emails (customer + admin)
 */
export async function sendBulkOrderEmails(data: BulkOrderEmailData): Promise<EmailResult> {
    try {
        const config = getConfig();

        // Customer email
        const customerTemplate = bulkOrderCustomerEmail(data);
        await sendEmail({
            sender: { email: config.businessEmail, name: BUSINESS_NAME },
            to: [{ email: data.order.customer_email, name: data.order.customer_name }],
            subject: customerTemplate.subject,
            htmlContent: customerTemplate.html,
            textContent: customerTemplate.text
        });
        console.log('✅ Customer email sent:', data.order.customer_email);

        // Admin email
        const adminTemplate = bulkOrderAdminEmail(data);
        await sendEmail({
            sender: { email: config.businessEmail, name: BUSINESS_NAME },
            to: [{ email: config.businessEmail, name: BUSINESS_NAME }],
            subject: adminTemplate.subject,
            htmlContent: adminTemplate.html,
            textContent: adminTemplate.text
        });
        console.log('✅ Admin email sent:', config.businessEmail);

        return { success: true };
    } catch (error: any) {
        console.error('❌ Error sending bulk order emails:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdate(data: OrderStatusEmailData): Promise<EmailResult> {
    try {
        const config = getConfig();
        const template = orderStatusUpdateEmail(data);
        await sendEmail({
            sender: { email: config.businessEmail, name: BUSINESS_NAME },
            to: [{ email: data.order.customer_email, name: data.order.customer_name }],
            subject: template.subject,
            htmlContent: template.html,
            textContent: template.text
        });
        console.log('✅ Status update email sent:', data.order.customer_email);

        return { success: true };
    } catch (error: any) {
        console.error('❌ Error sending status update email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send low stock alert email to admin
 */
export async function sendLowStockAlert(parts: any[]): Promise<EmailResult> {
    try {
        const config = getConfig();
        const subject = '⚠️ Low Stock Alert - Spare Parts';
        const html = `
      <h2>Low Stock Alert</h2>
      <p>The following parts are running low on stock:</p>
      <ul>
        ${parts.map(p => `<li><strong>${p.name}</strong> - Only ${p.stock_quantity} left (Code: ${p.part_code})</li>`).join('')}
      </ul>
      <p><a href="https://coolwind.co.in/dashboard-wind-ops/spare-parts">Manage Stock</a></p>
    `;

        await sendEmail({
            sender: { email: config.businessEmail, name: BUSINESS_NAME },
            to: [{ email: config.businessEmail, name: BUSINESS_NAME }],
            subject: subject,
            htmlContent: html
        });
        console.log('✅ Low stock alert sent');

        return { success: true };
    } catch (error: any) {
        console.error('❌ Error sending low stock alert:', error);
        return { success: false, error: error.message };
    }
}