import Providers from '@/components/Providers'

export const dynamic = 'force-dynamic'

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
	const {locale} = params
	let messages: Record<string, unknown> = {}
	try {
		messages = (await import(`@/data/translations/${locale}.json`)).default
	} catch (e) {
		messages = (await import('@/data/translations/en.json')).default
	}
	return (
		<Providers locale={locale} messages={messages}>
			{children}
		</Providers>
	)
}