'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { analytics } from '@/lib/analytics'

const FormSchema = z.object({
	name: z.string().min(2, 'Enter your full name'),
	phone: z.string().min(7, 'Enter a valid phone'),
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	service: z.enum(['spare_parts', 'ac_servicing', 'refrigerator_servicing', 'sales', 'other']),
	serviceDetails: z.string().max(2000).optional().or(z.literal('')),
	isUrgent: z.boolean().optional(),
	preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional().or(z.literal('')),
	consent: z.boolean().refine((v) => v === true, { message: 'Consent required' }),
	website: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof FormSchema>

export default function ContactForm({ compact }: { compact?: boolean }) {
	const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: { service: 'spare_parts' } as any,
	})

	async function onSubmit(values: FormValues) {
		analytics.formSubmission(values.service, Boolean(values.isUrgent))
		const res = await fetch('/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(values),
		})
		if (res.ok) reset()
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
			<input {...register('name')} placeholder="Full Name*" className="rounded border p-3"/>
			{errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
			<input type="tel" {...register('phone')} placeholder="Phone Number*" className="rounded border p-3"/>
			{errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
			{!compact && (
				<input {...register('email')} placeholder="Email" className="rounded border p-3 sm:col-span-2"/>
			)}
			<select {...register('service')} className="rounded border p-3 sm:col-span-2" required>
				<option value="spare_parts">Spare Parts Order</option>
				<option value="ac_servicing">AC Servicing</option>
				<option value="refrigerator_servicing">Refrigerator Servicing</option>
				<option value="sales">Sales Inquiry</option>
				<option value="other">Other</option>
			</select>
			{!compact && (
				<textarea {...register('serviceDetails')} rows={4} placeholder="Parts/Service Details" className="rounded border p-3 sm:col-span-2"/>
			)}
			{!compact && (
				<label className="flex items-center gap-2 text-sm sm:col-span-2">
					<input type="checkbox" {...register('isUrgent')} className="h-4 w-4"/> This is an emergency repair
				</label>
			)}
			{!compact && (
				<select {...register('preferredTime')} className="rounded border p-3 sm:col-span-2">
					<option value="">Preferred Contact Time</option>
					<option value="morning">Morning</option>
					<option value="afternoon">Afternoon</option>
					<option value="evening">Evening</option>
				</select>
			)}
			<label className="flex items-center gap-2 text-sm sm:col-span-2">
				<input type="checkbox" {...register('consent')} className="h-4 w-4"/> I agree to be contacted regarding my inquiry
			</label>
			{errors.consent && <p className="text-sm text-red-600 sm:col-span-2">{errors.consent.message}</p>}
			<input type="text" {...register('website')} className="hidden" aria-hidden="true" tabIndex={-1}/>
			<button disabled={isSubmitting} className="rounded bg-brand-blue px-5 py-3 text-white sm:col-span-2">{isSubmitting ? 'Submitting…' : 'Submit'}</button>
		</form>
	)
}