'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LanguageSwitcher(){
	const pathname = usePathname() || '/'
	const [locale, setLocale] = useState<'en'|'ml'>('en')
	useEffect(() => {
		const cookieLocale = typeof document !== 'undefined'
			? (document.cookie.split('; ').find(c => c.startsWith('NEXT_LOCALE='))?.split('=')[1] as 'en'|'ml'|undefined)
			: undefined
		const saved = (localStorage.getItem('locale') as 'en'|'ml'|null) || cookieLocale || 'en'
		setLocale(saved)
	}, [])
	function nextHref(target: 'en'|'ml'){
		const path = pathname || '/'
		if (target === 'en') {
			if (path.startsWith('/ml')) return path.replace(/^\/ml(?=\/|$)/, '/')
			if (path.startsWith('/en')) return path.replace(/^\/en(?=\/|$)/, '/')
			return path
		}
		// target === 'ml'
		if (path.startsWith('/ml')) return path
		if (path.startsWith('/en')) return path.replace(/^\/en(?=\/|$)/, '/ml')
		return path === '/' ? '/ml' : `/ml${path}`
	}
	function setNextLocaleCookie(target: 'en'|'ml'){
		const maxAge = 60*60*24*365
		document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${maxAge}`
	}
	return (
		<div className="inline-flex rounded border overflow-hidden text-sm" role="group" aria-label="Select language">
			<Link prefetch href={nextHref('en')} aria-pressed={!pathname.startsWith('/ml')} onClick={() => { setNextLocaleCookie('en'); localStorage.setItem('locale', 'en') }} className={`px-3 py-2 ${!pathname.startsWith('/ml') ? 'bg-primary-600 text-white' : 'bg-neutral-50 text-neutral-600'}`}>EN</Link>
			<Link prefetch href={nextHref('ml')} aria-pressed={pathname.startsWith('/ml')} onClick={() => { setNextLocaleCookie('ml'); localStorage.setItem('locale', 'ml') }} className={`px-3 py-2 ${pathname.startsWith('/ml') ? 'bg-primary-600 text-white' : 'bg-neutral-50 text-neutral-600'}`}>ML</Link>
		</div>
	)
}