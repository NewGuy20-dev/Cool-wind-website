'use client'

import { useEffect } from 'react'

declare global {
	interface Window {
		googleTranslateElementInit?: () => void
		google?: any
	}
}

function setCookie(name: string, value: string, days: number) {
	const date = new Date()
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
	const expires = `expires=${date.toUTCString()}`
	document.cookie = `${name}=${value};${expires};path=/`;
}

export default function GoogleTranslate({ targetLang }: { targetLang: 'en'|'ml' }){
	useEffect(() => {
		if (typeof window === 'undefined') return

		const shouldTranslate = targetLang === 'ml'

		// Persist the desired translation in cookie before script loads
		if (shouldTranslate) {
			setCookie('googtrans', '/en/ml', 365)
		} else {
			// Clear translation cookie to revert to English
			setCookie('googtrans', '/en/en', -1)
			setCookie('googtrans', '', -1)
		}

		// Append Google Translate script once
		const existing = document.getElementById('google-translate-script') as HTMLScriptElement | null
		if (!existing) {
			const s = document.createElement('script')
			s.id = 'google-translate-script'
			s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
			document.body.appendChild(s)
		}

		// Define init callback
		window.googleTranslateElementInit = () => {
			try {
				// eslint-disable-next-line new-cap
				new window.google.translate.TranslateElement(
					{
						pageLanguage: 'en',
						autoDisplay: false,
						includedLanguages: 'en,ml',
						layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
					},
					'google_translate_element'
				)
			} catch {}

			// Force select to Malayalam when needed
			if (shouldTranslate) {
				setTimeout(() => {
					const select = document.querySelector('select.goog-te-combo') as HTMLSelectElement | null
					if (select && select.value !== 'ml') {
						select.value = 'ml'
						select.dispatchEvent(new Event('change'))
					}
				}, 200)
			}
		}
	}, [targetLang])

	return <div id="google_translate_element" style={{ display: 'none' }} />
}


