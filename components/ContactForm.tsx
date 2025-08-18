'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { CheckCircle, AlertCircle, Send, Loader2, Phone, MessageCircle } from 'lucide-react'
import { analytics } from '@/lib/analytics'

const FormSchema = z.object({
	name: z.string().min(2, 'Enter your full name'),
	phone: z.string().min(7, 'Enter a valid phone number'),

	service: z.enum(['spare_parts', 'ac_servicing', 'refrigerator_servicing', 'sales', 'other']),
	serviceDetails: z.string().max(2000).optional().or(z.literal('')),
	isUrgent: z.boolean().optional(),
	preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional().or(z.literal('')),
	consent: z.boolean().refine((v) => v === true, { message: 'You must agree to be contacted' }),
	website: z.string().optional().or(z.literal('')), // Honeypot field
})

type FormValues = z.infer<typeof FormSchema>

interface ContactFormProps {
	compact?: boolean
	title?: string
	description?: string
}

export default function ContactForm({ compact = false, title, description }: ContactFormProps) {
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
	const [errorMessage, setErrorMessage] = useState('')

	const { 
		register, 
		handleSubmit, 
		formState: { errors, isSubmitting }, 
		reset 
	} = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: { 
			service: 'spare_parts',
			isUrgent: false,
		} as any,
	})

	async function onSubmit(values: FormValues) {
		try {
			setSubmitStatus('idle')
			setErrorMessage('')
			
			analytics.formSubmission(values.service, Boolean(values.isUrgent))
			
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			})

			if (res.ok) {
				setSubmitStatus('success')
				reset()
				// Auto-hide success message after 5 seconds
				setTimeout(() => setSubmitStatus('idle'), 5000)
			} else {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Submission failed')
			}
		} catch (error) {
			setSubmitStatus('error')
			setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
		}
	}

	if (submitStatus === 'success') {
		return (
			<div className="text-center py-8">
				<div className="mx-auto h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
					<CheckCircle className="h-8 w-8 text-secondary-600" />
				</div>
				<h3 className="text-lg font-semibold text-neutral-800 mb-2">
					Thank You!
				</h3>
				<p className="text-neutral-600 mb-4">
					We've received your request and will contact you within 2 hours.
				</p>
				<p className="text-sm text-neutral-500">
					For urgent issues, please call us directly at{' '}
					<a href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'}`} className="text-primary-600 hover:underline">
						{process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+91 85472 29991'}
					</a>
				</p>
			</div>
		)
	}

	return (
		<div>
			{title && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
					{description && <p className="text-neutral-600">{description}</p>}
				</div>
			)}

			{submitStatus === 'error' && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
						<div>
							<p className="text-red-800 font-medium">Submission Failed</p>
							<p className="text-red-700 text-sm">{errorMessage}</p>
						</div>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className={`space-y-4`}>
				{/* Name and Phone - always side by side on larger screens */}
				<div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
							Full Name *
						</label>
						<input
							id="name"
							{...register('name')}
							placeholder="Enter your full name"
							className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
						/>
						{errors.name && (
							<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
						)}
					</div>

					<div>
						<label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
							Phone Number *
						</label>
						<input
							id="phone"
							type="tel"
							{...register('phone')}
							placeholder="+91 98765 43210"
							className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
						/>
						{errors.phone && (
							<p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
						)}
					</div>
				</div>

				{/* Email field removed - contact via WhatsApp or phone only */}

				{/* Service Type */}
				<div>
					<label htmlFor="service" className="block text-sm font-medium text-neutral-700 mb-1">
						Service Required *
					</label>
					<select
						id="service"
						{...register('service')}
						className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
					>
						<option value="spare_parts">Spare Parts Order</option>
						<option value="ac_servicing">AC Repair & Service</option>
						<option value="refrigerator_servicing">Refrigerator Repair & Service</option>
						<option value="sales">New Appliance Sales</option>
						<option value="other">Other Service</option>
					</select>
				</div>

				{/* Service Details - full form only */}
				{!compact && (
					<div>
						<label htmlFor="serviceDetails" className="block text-sm font-medium text-neutral-700 mb-1">
							Service Details
						</label>
						<textarea
							id="serviceDetails"
							{...register('serviceDetails')}
							rows={4}
							placeholder="Describe your appliance issue, required parts, or service needs..."
							className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
						/>
					</div>
				)}

				{/* Emergency and Preferred Time - full form only */}
				{!compact && (
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									{...register('isUrgent')}
									className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
								/>
								<span className="text-neutral-700">This is an emergency repair</span>
							</label>
						</div>

						<div>
							<label htmlFor="preferredTime" className="block text-sm font-medium text-neutral-700 mb-1">
								Preferred Contact Time
							</label>
							<select
								id="preferredTime"
								{...register('preferredTime')}
								className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
							>
								<option value="">Any time</option>
								<option value="morning">Morning (8AM - 12PM)</option>
								<option value="afternoon">Afternoon (12PM - 5PM)</option>
								<option value="evening">Evening (5PM - 8PM)</option>
							</select>
						</div>
					</div>
				)}

				{/* Consent */}
				<div>
					<label className="flex items-start gap-2 text-sm">
						<input
							type="checkbox"
							{...register('consent')}
							className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5 flex-shrink-0"
						/>
						<span className="text-neutral-700">
							I agree to be contacted by Cool Wind Services regarding my service request
						</span>
					</label>
					{errors.consent && (
						<p className="mt-1 text-sm text-red-600">{errors.consent.message}</p>
					)}
				</div>

				{/* Honeypot field - hidden */}
				<input
					type="text"
					{...register('website')}
					className="hidden"
					aria-hidden="true"
					tabIndex={-1}
				/>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="h-5 w-5 animate-spin" />
							Submitting...
						</>
					) : (
						<>
							<Send className="h-5 w-5" />
							{compact ? 'Send Request' : 'Submit Request'}
						</>
					)}
				</button>

				{/* Direct Contact Options */}
				<div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
					<p className="text-center text-sm font-medium text-gray-700 mb-3">
						Need immediate help? Contact us directly:
					</p>
					<div className="flex flex-col sm:flex-row gap-3">
						<a 
							href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'}?text=Hi, I need help with ${compact ? 'a service request' : 'appliance service'}`}
							className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center gap-2"
							target="_blank"
							rel="noopener noreferrer"
						>
							<MessageCircle className="w-5 h-5" />
							WhatsApp Us
						</a>
						<a 
							href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'}`}
							className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center gap-2"
						>
							<Phone className="w-5 h-5" />
							Call Now
						</a>
					</div>
					<p className="text-center text-xs text-gray-600 mt-2">
						Available 9 AM - 8 PM | Emergency calls accepted 24/7
					</p>
				</div>
			</form>
		</div>
	)
}