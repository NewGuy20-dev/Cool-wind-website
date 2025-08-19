'use client'

import {NextIntlClientProvider} from 'next-intl'
import MotionProvider from './MotionProvider'

export default function Providers({children, locale, messages}:{children: React.ReactNode; locale: string; messages: Record<string, unknown>}){
	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<MotionProvider>
				{children}
			</MotionProvider>
		</NextIntlClientProvider>
	)
}