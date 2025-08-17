import Link from 'next/link'
import { PhoneCall } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link href="/" className="font-semibold">Cool Wind</Link>
				<nav className="hidden gap-6 md:flex">
					<Link href="/services">Services</Link>
					<Link href="/portfolio">Portfolio</Link>
					<Link href="/testimonials">Testimonials</Link>
					<Link href="/about">About</Link>
					<Link href="/contact">Contact</Link>
				</nav>
				<div className="flex items-center gap-3">
					<a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 rounded bg-brand-blue px-3 py-2 text-white text-sm"><PhoneCall size={16}/> {PHONE}</a>
					<LanguageSwitcher/>
				</div>
			</div>
		</header>
	)
}