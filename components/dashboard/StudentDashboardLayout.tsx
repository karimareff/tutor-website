'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BrainCircuit,
    BookOpen,
    Calendar,
    Users,
    User,
    LayoutGrid,
    Menu,
    X,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import TutorSwitcher from "@/components/TutorSwitcher";
import { useTutorContext } from "@/contexts/TutorContext";
import Image from "next/image";
import { useState, useEffect } from "react";

// Nav items defined as suffixes — basePath is computed dynamically
const academyNavSuffixes = [
    { suffix: "", altSuffix: "/home", label: "Home", icon: LayoutDashboard },
    { suffix: "/assignments", label: "Assignments", icon: BookOpen },
    { suffix: "/quizzes", label: "Quizzes", icon: BrainCircuit },
    { suffix: "/sessions", label: "Sessions", icon: Calendar },
    { suffix: "/profile", label: "Profile", icon: User },
];

const lobbyNavItems = [
    { href: "/dashboard/student", label: "My Academies", icon: LayoutGrid },
    { href: "/dashboard/student/tutors", label: "All Classes", icon: Users },
    { href: "/dashboard/student/profile", label: "Profile", icon: User },
];

interface StudentDashboardLayoutProps {
    children: React.ReactNode;
}

// Compute basePath and whether we're in academy URL mode
function useAcademyBasePath(pathname: string) {
    // Match /academy/[slug]/... (portal routes)
    const academyMatch = pathname.match(/^\/academy\/([^/]+)/);
    if (academyMatch) {
        return { basePath: `/academy/${academyMatch[1]}`, slug: academyMatch[1], isAcademyUrl: true };
    }
    return { basePath: '/dashboard/student', slug: null, isAcademyUrl: false };
}

// Map pathname to a page label for the browser tab title
function getPageLabel(pathname: string): string {
    if (pathname.endsWith('/assignments')) return 'Assignments';
    if (pathname.endsWith('/quizzes')) return 'Quizzes';
    if (pathname.endsWith('/sessions')) return 'Sessions';
    if (pathname.endsWith('/profile')) return 'Profile';
    return 'Home';
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    const pathname = usePathname();
    const { activeTutor, linkedTutors } = useTutorContext();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { basePath, isAcademyUrl } = useAcademyBasePath(pathname);

    const inAcademyMode = !!activeTutor;

    // ─── Dynamic browser tab title ───
    useEffect(() => {
        if (inAcademyMode) {
            const academyName = activeTutor.tutor?.academy_name || activeTutor.tutor?.profiles?.full_name || 'Academy';
            const pageLabel = getPageLabel(pathname);
            document.title = `${pageLabel} — ${academyName}`;
        } else {
            const pageLabel = getPageLabel(pathname);
            if (pageLabel === 'Home') {
                document.title = 'My Academies — TutorHub';
            } else {
                document.title = `${pageLabel} — TutorHub`;
            }
        }
    }, [pathname, inAcademyMode, activeTutor]);

    // ─── ACADEMY MODE: Top-nav website layout ───
    if (inAcademyMode) {
        const brandColor = activeTutor.tutor?.brand_color || '#3b82f6';
        const academyName = activeTutor.tutor?.academy_name || activeTutor.tutor?.profiles?.full_name || 'Academy';
        const avatarUrl = activeTutor.tutor?.profiles?.avatar_url;
        const tutorName = activeTutor.tutor?.profiles?.full_name;

        // Build nav items with dynamic basePath
        const homeHref = isAcademyUrl ? `${basePath}/home` : basePath;
        const navItems = academyNavSuffixes.map(item => ({
            href: item.suffix === "" ? homeHref : `${basePath}${item.suffix}`,
            label: item.label,
            icon: item.icon,
            isActive: item.suffix === ""
                ? (pathname === basePath || pathname === `${basePath}/home` || pathname === '/dashboard/student')
                : pathname === `${basePath}${item.suffix}`,
        }));

        return (
            <div className="min-h-screen bg-white">
                {/* Top Navigation Bar */}
                <nav
                    className="sticky top-0 z-50 border-b backdrop-blur-md"
                    style={{ backgroundColor: `${brandColor}08`, borderColor: `${brandColor}15` }}
                >
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between h-16">
                            {/* Left: Academy Brand */}
                            <Link href={homeHref} className="flex items-center gap-3 flex-shrink-0">
                                <div
                                    className="h-9 w-9 rounded-xl overflow-hidden relative flex-shrink-0 shadow-sm"
                                    style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
                                >
                                    {avatarUrl ? (
                                        <Image src={avatarUrl} alt={academyName} fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-white font-bold text-sm">
                                            {academyName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="font-bold text-slate-900 text-base leading-tight">{academyName}</h1>
                                    <p className="text-[11px] text-slate-400 leading-tight">by {tutorName}</p>
                                </div>
                            </Link>

                            {/* Center: Nav Links (desktop) */}
                            <div className="hidden md:flex items-center gap-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                        style={{
                                            color: item.isActive ? brandColor : '#64748b',
                                            backgroundColor: item.isActive ? `${brandColor}10` : 'transparent',
                                        }}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </span>
                                        {item.isActive && (
                                            <span
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                                                style={{ backgroundColor: brandColor }}
                                            />
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Right: Switcher + Mobile menu */}
                            <div className="flex items-center gap-2">
                                <TutorSwitcher />
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                                >
                                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t bg-white px-4 py-2 space-y-1" style={{ borderColor: `${brandColor}15` }}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                    style={{
                                        color: item.isActive ? brandColor : '#475569',
                                        backgroundColor: item.isActive ? `${brandColor}10` : 'transparent',
                                    }}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>

                {/* Content */}
                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t mt-12 py-6" style={{ borderColor: `${brandColor}10` }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            Powered by <Link href="/" className="font-medium text-slate-500 hover:text-slate-700">TutorHub</Link>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <div
                                className="h-4 w-4 rounded-md"
                                style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
                            />
                            {academyName}
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    // ─── LOBBY MODE: Sidebar layout ───
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="p-4 border-b">
                    <Link href="/dashboard/student" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                            T
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden">
                            <h2 className="font-bold text-base text-slate-900">TutorHub</h2>
                            <p className="text-xs text-slate-500">
                                {linkedTutors.length > 0
                                    ? `${linkedTutors.length} academ${linkedTutors.length > 1 ? 'ies' : 'y'}`
                                    : 'Student Portal'}
                            </p>
                        </div>
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {lobbyNavItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    tooltip={item.label}
                                >
                                    <Link href={item.href}>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <span className="font-semibold md:hidden">My Academies</span>
                    </div>
                    <TutorSwitcher />
                </header>
                <main className="flex-1 p-6 min-h-screen bg-slate-50">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
