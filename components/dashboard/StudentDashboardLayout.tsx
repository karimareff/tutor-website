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

const navItems = [
    { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/student/quizzes", label: "Quizzes", icon: BrainCircuit },
    { href: "/dashboard/student/assignments", label: "Assignments", icon: BookOpen },
    { href: "/dashboard/student/sessions", label: "Sessions", icon: Calendar },
    { href: "/dashboard/student/tutors", label: "My Tutors", icon: Users },
    { href: "/dashboard/student/profile", label: "Profile", icon: User },
];

interface StudentDashboardLayoutProps {
    children: React.ReactNode;
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="p-4 border-b">
                    <Link href="/dashboard/student" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            S
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden">
                            <h2 className="font-bold text-lg text-slate-900">StudentHub</h2>
                            <p className="text-xs text-slate-500">Your learning journey</p>
                        </div>
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {navItems.map((item) => (
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
                        <span className="font-semibold md:hidden">StudentHub</span>
                    </div>
                    <TutorSwitcher />
                </header>
                <main className="flex-1 p-6 bg-slate-50 min-h-screen">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

