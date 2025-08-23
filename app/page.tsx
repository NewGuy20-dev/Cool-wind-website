import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function RootPage() {
	const cookieStore = await cookies()
	const nextLocale = cookieStore.get('NEXT_LOCALE')?.value
	if (nextLocale === 'ml') {
		redirect('/ml')
	}
	redirect('/en')
}