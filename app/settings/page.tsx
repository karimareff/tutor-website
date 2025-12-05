'use client'

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import ProfileForm from "@/components/ProfileForm";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
    const { user, logout } = useAuth();



    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12">
                <div className="container max-w-2xl">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between mb-6 md:hidden">
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <Button variant="ghost" size="icon" onClick={() => logout()} className="text-destructive">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Desktop Header */}
                    <h1 className="text-3xl font-bold mb-8 hidden md:block">Account Settings</h1>

                    <ProfileForm user={user} />

                    <div className="mt-8 pt-8 border-t">
                        <Button
                            variant="destructive"
                            className="w-full md:w-auto"
                            onClick={() => logout()}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
