import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Proxy handles subdomain-based academy routing for Next.js 16+
// e.g., ahmed.tutorhub.com → /academy/ahmed
export default async function proxy(req: NextRequest) {
    const url = req.nextUrl
    const hostname = req.headers.get('host') || ''

    // Skip for app routes that shouldn't be subdomain-routed
    if (
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/auth') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/signup') ||
        url.pathname.startsWith('/join') ||
        url.pathname.startsWith('/pricing') ||
        url.pathname.startsWith('/about') ||
        url.pathname.startsWith('/how-it-works') ||
        url.pathname.startsWith('/academy')
    ) {
        return NextResponse.next()
    }

    // Get the subdomain
    const domain = hostname.split(':')[0]
    const isLocalhost = domain === 'localhost'
    const rootDomain = isLocalhost ? 'localhost' : process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'tutorhub.com'

    let subdomain = domain.endsWith(`.${rootDomain}`)
        ? domain.replace(`.${rootDomain}`, '')
        : null

    if (domain === 'localhost') {
        subdomain = null
    }

    // Skip if no subdomain or if it's a reserved subdomain
    const reservedSubdomains = ['www', 'app', 'api', 'admin', 'mail', 'staging']
    if (!subdomain || reservedSubdomains.includes(subdomain)) {
        return NextResponse.next()
    }

    // Rewrite the path to the academy page
    const rewriteUrl = new URL(`/academy/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, req.url)
    const response = NextResponse.rewrite(rewriteUrl)
    response.headers.set('x-academy-slug', subdomain)

    return response
}

export const config = {
    matcher: [
        '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
    ],
}

