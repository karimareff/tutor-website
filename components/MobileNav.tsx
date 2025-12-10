"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const MobileNav = () => {
    const pathname = usePathname();
    const { user, profile } = useAuth();

    const dashboardLink = profile?.role === 'tutor' ? "/dashboard/teacher" : "/dashboard/student";

    const links = [
        {
            href: "/",
            label: "Home",
            icon: Home,
        },
        {
            href: "/tutors",
            label: "Search",
            icon: Search,
        },
        {
            href: user ? "/my-bookings" : "/login",
            label: "Bookings",
            icon: Calendar,
        },
        {
            href: user ? "/settings" : "/signup",
            label: "Profile",
            icon: User,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg md:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-primary" : "text-slate-500 hover:text-primary"
                            )}
                        >
                            <Icon className="h-6 w-6" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
