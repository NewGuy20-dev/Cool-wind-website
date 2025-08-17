'use client'

import { useEffect, useState } from 'react'

export default function CookieConsent(){
	const [visible, setVisible] = useState(false)
	useEffect(() => {
		const ok = localStorage.getItem('cookie-consent')
		if (!ok) setVisible(true)
	}, [])
	if (!visible) return null
	return (
		<div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-dark text-white">
			<div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4 text-sm">
				<p>We use cookies for analytics. By using this site, you agree.</p>
				<button
					className="rounded bg-brand-blue px-3 py-2"
					onClick={() => { localStorage.setItem('cookie-consent', '1'); setVisible(false) }}
				>
					OK
				</button>
			</div>
		</div>
	)
}