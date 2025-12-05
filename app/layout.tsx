import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import MobileNav from '@/components/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Tutor Website - Find Your Perfect Tutor',
    description: 'Connect with qualified tutors for SAT, ACT, IGCSE and more',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} overflow-x-hidden`}>
                <Providers>
                    {children}
                    <MobileNav />
                </Providers>
            </body>
        </html>
    )
}
