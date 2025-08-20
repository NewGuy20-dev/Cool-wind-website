'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LanguageSwitcher(){
	const pathname = usePathname() || '/'
	const [locale, setLocale] = useState<'en'|'ml'>('en')
	useEffect(() => {
		const saved = (localStorage.getItem('locale') as 'en'|'ml'|null) || 'en'
		setLocale(saved)
	}, [])
	function nextHref(target: 'en'|'ml'){
		if (target === 'en') {
			return pathname.replace(/^\/ml(\/|$)/, '/')
		}
		return pathname.startsWith('/ml') ? pathname : `/ml${pathname}`
	}
	return (
		<div className="inline-flex rounded border overflow-hidden text-sm notranslate" role="group" aria-label="Select language">
			<Link prefetch href={nextHref('en')} aria-pressed={!pathname.startsWith('/ml')} onClick={() => localStorage.setItem('locale', 'en')} className={`px-3 py-2 ${!pathname.startsWith('/ml') ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}>EN</Link>
			<Link prefetch href={nextHref('ml')} aria-pressed={pathname.startsWith('/ml')} onClick={() => localStorage.setItem('locale', 'ml')} className={`px-3 py-2 ${pathname.startsWith('/ml') ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}>ML</Link>
		</div>
	)
}