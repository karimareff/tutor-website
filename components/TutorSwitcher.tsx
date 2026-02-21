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
import { ChevronDown, Check, LayoutGrid, Repeat } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function TutorSwitcher() {
    const { linkedTutors, activeTutor, activeTutorId, setActiveTutor, clearActiveTutor } = useTutorContext();
    const router = useRouter();

    if (linkedTutors.length === 0) {
        return null;
    }

    const activeBrandColor = activeTutor?.tutor?.brand_color || '#3b82f6';

    const handleSwitchAcademy = (item: typeof linkedTutors[0]) => {
        const slug = item.tutor?.slug;
        if (slug) {
            setActiveTutor(item.tutor_id);
            router.push(`/academy/${slug}/home`);
        } else {
            setActiveTutor(item.tutor_id);
        }
    };

    const handleGoToLobby = () => {
        clearActiveTutor();
        router.push('/dashboard/student');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 max-w-[220px]">
                    {activeTutor ? (
                        <>
                            <div
                                className="h-6 w-6 rounded-lg overflow-hidden relative flex-shrink-0"
                                style={{ background: `linear-gradient(135deg, ${activeBrandColor}, ${activeBrandColor}cc)` }}
                            >
                                {activeTutor?.tutor?.profiles?.avatar_url ? (
                                    <Image
                                        src={activeTutor.tutor.profiles.avatar_url}
                                        alt={activeTutor.tutor.profiles.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white">
                                        {(activeTutor?.tutor?.academy_name || activeTutor?.tutor?.profiles?.full_name)?.[0] || '?'}
                                    </div>
                                )}
                            </div>
                            <span className="truncate text-sm font-medium">
                                {activeTutor?.tutor?.academy_name || activeTutor?.tutor?.profiles?.full_name || 'Academy'}
                            </span>
                        </>
                    ) : (
                        <>
                            <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm">My Academies</span>
                        </>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Switch Academy
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* My Academies (lobby) option */}
                <DropdownMenuItem
                    onClick={handleGoToLobby}
                    className="cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 w-full">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <LayoutGrid className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="truncate block text-sm font-medium">My Academies</span>
                            <span className="text-xs text-slate-400">View all</span>
                        </div>
                        {!activeTutorId && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {linkedTutors.map((item) => {
                    const brandColor = item.tutor?.brand_color || '#3b82f6';
                    const academyName = item.tutor?.academy_name || item.tutor?.profiles?.full_name;
                    const isActive = item.tutor_id === activeTutorId;

                    return (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => handleSwitchAcademy(item)}
                            className="cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5 w-full">
                                <div
                                    className="h-8 w-8 rounded-lg overflow-hidden relative flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
                                >
                                    {item.tutor?.profiles?.avatar_url ? (
                                        <Image
                                            src={item.tutor.profiles.avatar_url}
                                            alt={item.tutor.profiles.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white">
                                            {academyName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="truncate block text-sm font-medium">{academyName}</span>
                                    {item.tutor?.subjects?.[0] && (
                                        <span className="text-xs text-slate-400 truncate block">{item.tutor.subjects[0]}</span>
                                    )}
                                </div>
                                {isActive && (
                                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: brandColor }} />
                                )}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
