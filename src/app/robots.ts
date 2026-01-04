import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/dashboard/', // Don't crawl private dashboard pages
        },
        sitemap: 'https://stackmemory.app/sitemap.xml',
    }
}
