'use client'

import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500">Manage your public tutor profile and account settings</p>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <ProfileForm user={user} role="tutor" />
            </div>
        </div>
    );
}
