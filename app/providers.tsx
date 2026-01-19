'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { TutorProvider } from '@/contexts/TutorContext'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AuthProvider>
                    <TutorProvider>
                        {children}
                        <Toaster />
                        <Sonner />
                    </TutorProvider>
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    )
}
