'use client'

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import ProfileForm from "@/components/ProfileForm";

export default function SettingsPage() {
    const { user } = useAuth();



    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12">
                <div className="container max-w-2xl">
                    <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                    <ProfileForm user={user} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
