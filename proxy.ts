import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Replaced 'middleware' with 'proxy' to comply with Next.js 16+ conventions
export default async function proxy(req: NextRequest) {
    const url = req.nextUrl
    const hostname = req.headers.get('host') || ''

    // Get the subdomain
    const domain = hostname.split(':')[0]
    const isLocalhat = domain === 'localhost'
    const rootDomain = isLocalhat ? 'localhost' : process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'platform.com'

    let subdomain = domain.endsWith(`.${rootDomain}`)
        ? domain.replace(`.${rootDomain}`, '')
        : null



    if (domain === 'localhost') {
        subdomain = null
    }

    // Skip if no subdomain or if it's a reserved subdomain
    if (!subdomain || subdomain === 'www' || subdomain === 'app') {
        console.log('No subdomain or reserved:', subdomain)
        return NextResponse.next()
    }

    console.log(`Rewriting subdomain ${subdomain} to /tutor/${subdomain}${url.pathname}`)

    // Rewrite the path to the tutor page
    return NextResponse.rewrite(new URL(`/tutor/${subdomain}${url.pathname}`, req.url))
}

export const config = {
    matcher: [
        '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
    ],
}
