import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ContactFormSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	phone: z.string().min(7, 'Phone number must be valid'),

	service: z.enum(['spare_parts', 'ac_servicing', 'refrigerator_servicing', 'sales', 'other']),
	serviceDetails: z.string().optional(),
	isUrgent: z.boolean().optional(),
	preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional().or(z.literal('')),
	consent: z.boolean().refine((v) => v === true, { message: 'Consent is required' }),
	website: z.string().optional().or(z.literal('')), // Honeypot field
})

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		
		// Validate the form data
		const validatedData = ContactFormSchema.parse(body)
		
		// Check honeypot field - if filled, it's likely spam
		if (validatedData.website && validatedData.website.length > 0) {
			return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
		}

		// Here you would typically:
		// 1. Send WhatsApp notification to business owner
		// 2. Save to database
		// 3. Send SMS confirmation to customer
		// 4. Integrate with CRM
		
		// For now, we'll just log the submission
		console.log('Contact form submission:', {
			name: validatedData.name,
			phone: validatedData.phone,
			service: validatedData.service,
			isUrgent: validatedData.isUrgent,
			timestamp: new Date().toISOString(),
		})

		// In a real implementation, you might want to:
		// - Send WhatsApp message using WhatsApp Business API
		// - Save to database (PostgreSQL, MongoDB, etc.)
		// - Send SMS notifications to business owner
		// - Integrate with CRM system
		
		return NextResponse.json({ 
			success: true, 
			message: 'Thank you! We will contact you within 2 hours.' 
		})

	} catch (error) {
		console.error('Contact form error:', error)
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid form data', details: error.issues },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 }
		)
	}
}

// Handle unsupported methods
export async function GET() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}