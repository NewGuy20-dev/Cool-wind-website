import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

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

		// Initialize Supabase client
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		)

		// Get client IP and user agent for tracking
		const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
		const userAgent = request.headers.get('user-agent') || 'unknown'

		// Save to Supabase
		const { data: submission, error: dbError } = await supabase
			.from('contact_submissions')
			.insert({
				name: validatedData.name,
				phone: validatedData.phone,
				service: validatedData.service,
				service_details: validatedData.serviceDetails || null,
				is_urgent: validatedData.isUrgent || false,
				preferred_time: validatedData.preferredTime || null,
				ip_address: clientIP,
				user_agent: userAgent,
				status: 'pending'
			})
			.select()
			.single()

		if (dbError) {
			console.error('Database error:', dbError)
			return NextResponse.json(
				{ error: 'Failed to save submission. Please try again.' },
				{ status: 500 }
			)
		}

		// Log the submission for immediate tracking
		console.log('Contact form submission saved:', {
			id: submission.id,
			name: validatedData.name,
			phone: validatedData.phone,
			service: validatedData.service,
			isUrgent: validatedData.isUrgent,
			timestamp: new Date().toISOString(),
		})

		// TODO: Add WhatsApp notification to business owner
		// TODO: Send SMS confirmation to customer
		// TODO: Integrate with CRM system
		
		return NextResponse.json({ 
			success: true, 
			message: 'Thank you! We will contact you within 2 hours.',
			submissionId: submission.id
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