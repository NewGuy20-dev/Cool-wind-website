import { NextResponse } from 'next/server'
import { z } from 'zod'
import { LRUCache } from 'lru-cache'
import nodemailer from 'nodemailer'

const schema = z.object({
	name: z.string().min(2).max(100),
	phone: z.string().min(7).max(20),
	email: z.string().email().optional().or(z.literal('')),
	service: z.enum(['spare_parts', 'ac_servicing', 'refrigerator_servicing', 'sales', 'other']),
	serviceDetails: z.string().max(2000).optional().or(z.literal('')),
	isUrgent: z.preprocess((v) => v === 'on' || v === true || v === 'true', z.boolean().optional()),
	preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional().or(z.literal('')),
	consent: z.preprocess((v) => v === 'on' || v === true || v === 'true', z.boolean()),
	website: z.string().optional().or(z.literal('')), // honeypot
})

type FormData = z.infer<typeof schema>

const rateLimit = new LRUCache<string, { count: number; first: number }>({
	max: 500,
	ttl: 60 * 60 * 1000,
})

function isRateLimited(ip: string) {
	const now = Date.now()
	const entry = rateLimit.get(ip)
	if (!entry) {
		rateLimit.set(ip, { count: 1, first: now })
		return false
	}
	entry.count += 1
	rateLimit.set(ip, entry)
	return entry.count > 3
}

export async function POST(request: Request) {
	const ip = request.headers.get('x-forwarded-for') || 'unknown'
	if (isRateLimited(ip)) {
		return NextResponse.json({ ok: false, error: 'Too many submissions. Please try later.' }, { status: 429 })
	}

	const contentType = request.headers.get('content-type') || ''
	let raw: Record<string, unknown>
	if (contentType.includes('application/json')) {
		raw = await request.json()
	} else {
		const form = await request.formData()
		raw = Object.fromEntries(form.entries())
	}

	const parsed = schema.safeParse(raw)
	if (!parsed.success) {
		return NextResponse.json({ ok: false, error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
	}

	const data: FormData = parsed.data

	if (data.website && data.website.trim() !== '') {
		return NextResponse.json({ ok: true })
	}

	try {
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT || 587),
			secure: false,
			auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
		})

		const subject = data.service === 'spare_parts' ? 'Parts Inquiry' : 'Service Booking'

		await transporter.sendMail({
			from: process.env.SMTP_USER || 'no-reply@coolwindservices.com',
			to: process.env.SMTP_USER || 'contact@coolwindservices.com',
			subject: `[Cool Wind] ${subject} - ${data.name}`,
			html: `
				<h2>New Lead</h2>
				<p><strong>Name:</strong> ${data.name}</p>
				<p><strong>Phone:</strong> ${data.phone}</p>
				<p><strong>Email:</strong> ${data.email || '-'}</p>
				<p><strong>Service:</strong> ${data.service}</p>
				<p><strong>Urgent:</strong> ${Boolean(data.isUrgent) ? 'Yes' : 'No'}</p>
				<p><strong>Preferred Time:</strong> ${data.preferredTime || '-'}</p>
				<p><strong>Details:</strong><br/>${(data.serviceDetails || '').replace(/</g, '&lt;')}</p>
			`,
		})

		if (data.email) {
			await transporter.sendMail({
				from: process.env.SMTP_USER || 'no-reply@coolwindservices.com',
				to: data.email,
				subject: 'We received your inquiry - Cool Wind Services',
				html: `Thanks ${data.name}, we received your request and will contact you shortly at ${data.phone}.`,
			})
		}

		return NextResponse.json({ ok: true })
	} catch (error) {
		return NextResponse.json({ ok: false, error: 'Failed to send email' }, { status: 500 })
	}
}