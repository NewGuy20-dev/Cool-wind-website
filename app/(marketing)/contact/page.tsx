'use client'

import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
	const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'
	const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
	return (
		<main className="mx-auto max-w-6xl px-4 py-10">
			<h1 className="text-3xl font-bold">Contact Us</h1>
			<div className="mt-8 grid gap-8 lg:grid-cols-3">
				<div className="rounded border bg-white p-5 shadow-sm lg:col-span-2">
					<ContactForm/>
				</div>
				<div className="rounded border bg-white p-5 shadow-sm">
					<h2 className="text-xl font-semibold">Contact Information</h2>
					<p className="mt-2 text-neutral-medium">Phone: <a className="underline" href={`tel:${phone}`}>{phone}</a></p>
					<p className="text-neutral-medium">WhatsApp: <a className="underline" href={`https://wa.me/${whatsapp}`}>{whatsapp}</a></p>
					<p className="text-neutral-medium">Hours: Mon–Sat 08:00–20:00</p>
					<div className="mt-3 aspect-[4/3] rounded bg-neutral-light"/>
					<Link href="/privacy" className="mt-4 inline-block text-sm text-brand-blue">Privacy Policy</Link>
				</div>
			</div>
		</main>
	)
}