import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
	locales: ['en', 'ml'],
	defaultLocale: 'en',
	localePrefix: 'as-needed',
})

export const config = {
	matcher: ['/', '/(ml|en)/:path*'],
}