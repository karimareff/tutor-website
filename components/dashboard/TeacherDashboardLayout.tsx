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

const navItems = [
    { href: "/dashboard/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/teacher/quizzes", label: "Quizzes", icon: BrainCircuit },
    { href: "/dashboard/teacher/assignments", label: "Assignments", icon: BookOpen },
    { href: "/dashboard/teacher/sessions", label: "Sessions", icon: Calendar },
    { href: "/dashboard/teacher/students", label: "Students", icon: Users },
    { href: "/settings", label: "Profile", icon: User },
];

interface TeacherDashboardLayoutProps {
    children: React.ReactNode;
}

export default function TeacherDashboardLayout({ children }: TeacherDashboardLayoutProps) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="p-4 border-b">
                    <Link href="/dashboard/teacher" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            T
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden">
                            <h2 className="font-bold text-lg text-slate-900">TeacherHub</h2>
                            <p className="text-xs text-slate-500">Manage your classroom</p>
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
                <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
                    <SidebarTrigger />
                    <span className="font-semibold">TeacherHub</span>
                </header>
                <main className="flex-1 p-6 bg-slate-50 min-h-screen">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
