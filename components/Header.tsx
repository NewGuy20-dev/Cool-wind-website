'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { PhoneCall, Menu, X } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'

const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const pathname = usePathname()

	// Controls for a single-spin animation on the logo
	const logoControls = useAnimation()
	const triggerLogoSpin = async () => {
		await logoControls.start({
			rotate: 360,
			transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
		})
		// Reset rotation instantly after completing the spin
		logoControls.set({ rotate: 0 })
	}

	const navigation = [
		{ name: 'Home', href: '/' },
		{ name: 'Services', href: '/services' },
		{ name: 'Portfolio', href: '/portfolio' },
		{ name: 'Testimonials', href: '/testimonials' },
		{ name: 'About', href: '/about' },
		{ name: 'Contact', href: '/contact' },
	]

	const withLocale = (href: string) => (pathname?.startsWith('/ml') && href !== '/' ? `/ml${href}` : pathname?.startsWith('/ml') && href === '/' ? '/ml' : href)

	return (
		<header className="sticky top-0 z-50 border-b bg-neutral-50/95 backdrop-blur-sm shadow-sm">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				{/* Logo */}
				<Link href={withLocale('/')} className="flex items-center space-x-2">
					<motion.div
						animate={logoControls}
						onMouseEnter={triggerLogoSpin}
						onClick={triggerLogoSpin}
						onTouchStart={triggerLogoSpin}
						className="rounded-lg"
						style={{ display: 'inline-block' }}
					>
						<Image
							src="/logo.png"
							alt="Cool Wind logo"
							width={40}
							height={40}
							unoptimized
							className="rounded-lg"
							priority
						/>
					</motion.div>
					<span className="font-bold text-xl text-neutral-800">Cool Wind</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden gap-8 md:flex" role="navigation" aria-label="Main navigation">
					{navigation.map((item) => (
						<Link
							key={item.name}
							href={withLocale(item.href)}
							aria-current={pathname === item.href ? 'page' : undefined}
							className={`text-neutral-600 hover:text-primary-600 font-medium transition-colors duration-200 relative group ${pathname === item.href ? 'text-primary-700' : ''}`}
						>
							{item.name}
							<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-200 group-hover:w-full"></span>
						</Link>
					))}
				</nav>

				{/* Right side controls */}
				<div className="flex items-center gap-3">
					{/* Phone number - always visible */}
					<a
						href={`tel:${PHONE}`}
						className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-white text-sm font-medium hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
						aria-label={`Call us at ${PHONE}`}
					>
						<PhoneCall size={16} />
						<span className="hidden sm:inline">{PHONE}</span>
						<span className="sm:hidden">Call</span>
					</a>

					{/* Language switcher */}
					<LanguageSwitcher />

					{/* Mobile menu button */}
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-expanded={mobileMenuOpen}
						aria-label="Toggle mobile menu"
					>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
						className="md:hidden border-t bg-white"
					>
						<div className="px-4 py-3 space-y-1">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="block px-3 py-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 font-medium transition-colors duration-200"
									onClick={() => setMobileMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	)
}