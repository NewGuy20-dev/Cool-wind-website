/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://coolwind.co.in',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: [
        '/api/*', 
        '/admin/*', 
        '/private/*',
        '/dashboard-wind-ops',
        '/dashboard-wind-ops/*',
        '/robots.txt',
        '/sitemap.xml',
        '/icon.png'
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/private/', '/dashboard-wind-ops/']
            }
        ],
        additionalSitemaps: [
            'https://coolwind.co.in/sitemap.xml'
        ]
    },
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    transform: async (config, path) => {
        // Custom priority based on path
        let priority = config.priority;

        if (path === '/') {
            priority = 1.0;
        } else if (path.includes('/about') || path.includes('/contact')) {
            priority = 0.8;
        } else if (path.includes('/blog') || path.includes('/services')) {
            priority = 0.9;
        }

        return {
            loc: path,
            changefreq: config.changefreq,
            priority: priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        };
    }
};