'use client'

import { useTutorContext } from "@/contexts/TutorContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Users, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TutorSwitcher() {
    const { linkedTutors, activeTutor, activeTutorId, setActiveTutor } = useTutorContext();

    if (linkedTutors.length <= 1) {
        // Don't show switcher if only one or no tutor
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 max-w-[200px]">
                    <div className="h-6 w-6 rounded-full bg-primary/10 overflow-hidden relative flex-shrink-0">
                        {activeTutor?.tutor?.profiles?.avatar_url ? (
                            <Image
                                src={activeTutor.tutor.profiles.avatar_url}
                                alt={activeTutor.tutor.profiles.full_name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-medium text-primary">
                                {activeTutor?.tutor?.profiles?.full_name?.[0] || '?'}
                            </div>
                        )}
                    </div>
                    <span className="truncate text-sm">
                        {activeTutor?.tutor?.profiles?.full_name || 'Select Tutor'}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Switch Tutor
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {linkedTutors.map((item) => (
                    <DropdownMenuItem
                        key={item.id}
                        onClick={() => setActiveTutor(item.tutor_id)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <div className="h-7 w-7 rounded-full bg-slate-100 overflow-hidden relative flex-shrink-0">
                                {item.tutor?.profiles?.avatar_url ? (
                                    <Image
                                        src={item.tutor.profiles.avatar_url}
                                        alt={item.tutor.profiles.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs font-medium text-slate-400">
                                        {item.tutor?.profiles?.full_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <span className="truncate flex-1">{item.tutor?.profiles?.full_name}</span>
                            {item.tutor_id === activeTutorId && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/student/select-tutor" className="cursor-pointer">
                        View All Tutors
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
