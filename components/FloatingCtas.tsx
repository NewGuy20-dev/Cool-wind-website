'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { analytics } from '@/lib/analytics'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function FloatingCtas(){
	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
			<a
				aria-label="WhatsApp"
				onClick={() => analytics.whatsappClick()}
				href={`https://wa.me/${WHATSAPP}`}
				className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow"
			>
				<MessageCircle size={18}/> WhatsApp
			</a>
			<a
				aria-label="Call"
				onClick={() => analytics.phoneCallClick('floating_call')}
				href={`tel:${PHONE}`}
				className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-white shadow"
			>
				<Phone size={18}/> Call
			</a>
		</div>
	)
}