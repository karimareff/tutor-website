'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Copy, ExternalLink, Save, Loader2, Palette, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { COLOR_THEMES } from "@/lib/color-themes";

export default function AcademySettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tutorSlug, setTutorSlug] = useState<string>('');
    const [formData, setFormData] = useState({
        academy_name: '',
        brand_color: '#3b82f6',
        welcome_message: '',
    });

    useEffect(() => {
        if (user) fetchAcademySettings();
    }, [user]);

    const fetchAcademySettings = async () => {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .select('slug, academy_name, brand_color, welcome_message')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setTutorSlug(data.slug || '');
                setFormData({
                    academy_name: data.academy_name || '',
                    brand_color: data.brand_color || '#3b82f6',
                    welcome_message: data.welcome_message || '',
                });
            }
        } catch (error) {
            console.error('Error fetching academy settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const { error } = await supabase
                .from('tutors')
                .update({
                    academy_name: formData.academy_name || null,
                    brand_color: formData.brand_color,
                    welcome_message: formData.welcome_message || null,
                })
                .eq('id', user?.id);

            if (error) throw error;
            toast.success('Academy settings saved!');
        } catch (error: any) {
            console.error('Error saving academy settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const academyUrl = tutorSlug ? `${window.location.origin}/academy/${tutorSlug}` : '';

    const copyUrl = () => {
        navigator.clipboard.writeText(academyUrl);
        toast.success('Academy link copied!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Academy</h1>
                <p className="text-slate-500">Customize how your students see your academy</p>
            </div>

            {/* Academy Link */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Academy Page
                    </CardTitle>
                    <CardDescription>
                        Share this link with students to show them your branded academy page
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Input
                            value={academyUrl}
                            readOnly
                            className="font-mono text-sm bg-slate-50"
                        />
                        <Button variant="outline" size="icon" onClick={copyUrl} title="Copy link">
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" asChild title="Preview">
                            <Link href={`/academy/${tutorSlug}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Branding Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Academy Branding
                    </CardTitle>
                    <CardDescription>
                        Customize your academy's look and feel
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Academy Name */}
                    <div className="space-y-2">
                        <Label htmlFor="academy_name">Academy Name</Label>
                        <Input
                            id="academy_name"
                            placeholder="e.g. Ahmed's Math Academy"
                            value={formData.academy_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, academy_name: e.target.value }))}
                        />
                        <p className="text-xs text-slate-500">
                            Leave blank to use your name as the academy name
                        </p>
                    </div>

                    {/* Color Theme Presets */}
                    <div className="space-y-2">
                        <Label>Color Theme</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {COLOR_THEMES.map((theme) => {
                                const isSelected = formData.brand_color.toLowerCase() === theme.color.toLowerCase();
                                return (
                                    <button
                                        key={theme.name}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, brand_color: theme.color }))}
                                        className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-105"
                                        style={{
                                            borderColor: isSelected ? theme.color : '#e2e8f0',
                                            backgroundColor: isSelected ? `${theme.color}08` : 'transparent',
                                        }}
                                    >
                                        <div
                                            className="h-8 w-8 rounded-lg shadow-sm flex items-center justify-center"
                                            style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.color}cc)` }}
                                        >
                                            {isSelected && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-600">{theme.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Color Picker */}
                    <div className="space-y-2">
                        <Label htmlFor="brand_color">Custom Color</Label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                id="brand_color"
                                value={formData.brand_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                                className="h-10 w-14 rounded-lg cursor-pointer border border-slate-200"
                            />
                            <Input
                                value={formData.brand_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                                className="max-w-[120px] font-mono text-sm"
                                placeholder="#3b82f6"
                            />
                            {/* Preview swatch */}
                            <div
                                className="h-10 flex-1 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                                style={{ backgroundColor: formData.brand_color }}
                            >
                                Preview
                            </div>
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="space-y-2">
                        <Label htmlFor="welcome_message">Welcome Message</Label>
                        <Textarea
                            id="welcome_message"
                            placeholder="Welcome to my class! Here you'll find..."
                            value={formData.welcome_message}
                            onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                            rows={3}
                        />
                        <p className="text-xs text-slate-500">
                            Shown on your academy landing page when students visit your link
                        </p>
                    </div>

                    {/* Save Button */}
                    <Button onClick={handleSave} disabled={saving} className="w-full">
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Academy Settings
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

