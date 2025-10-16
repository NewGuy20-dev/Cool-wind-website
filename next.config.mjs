/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'
const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://translate.google.com https://translate.googleapis.com https://va.vercel-scripts.com https://translate-pa.googleapis.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
    "img-src 'self' data: https://www.google-analytics.com https://translate.googleapis.com https://translate.google.com https://fonts.gstatic.com https://www.google.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${isDev ? 'ws://localhost:* http://localhost:* ' : ''}https://www.google-analytics.com https://translate.googleapis.com https://translate.google.com https://va.vercel-scripts.com https://vitals.vercel-analytics.com`,
    "frame-src 'self' https://translate.google.com https://www.google.com",
].join('; ')

const nextConfig = {
    headers: async () => [
        {
            source: '/(.*)',
            headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Content-Security-Policy', value: csp },
            ],
        },
    ],
}

export default nextConfig