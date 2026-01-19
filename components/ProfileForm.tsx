'use client'

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Upload, User as UserIcon, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormProps {
    user: any;
    onUpdate?: () => void;
    embedded?: boolean;
}

export default function ProfileForm({ user, onUpdate, embedded = false }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        avatar_url: "",
        subjects: [] as string[],
        slug: "",
    });

    const AVAILABLE_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Computer Science", "Business", "Economics"];
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            // Fetch profile data
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // Fetch tutor data for slug
            const { data: tutorData, error: tutorError } = await supabase
                .from('tutors')
                .select('subjects, slug')
                .eq('id', user.id)
                .single();

            const subjects = tutorData?.subjects || [];
            const slug = tutorData?.slug || "";

            setFormData({
                full_name: profileData.full_name || "",
                avatar_url: profileData.avatar_url || "",
                subjects: subjects,
                slug: slug,
            });
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
            toast.success('Avatar uploaded successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Error uploading avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation for Slug
            if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
                throw new Error("Platform URL can only contain lowercase letters, numbers, and dashes.");
            }

            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    avatar_url: formData.avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update Tutor (Slug & Subjects)
            const { error: tutorError } = await supabase
                .from('tutors')
                .upsert({
                    id: user.id,
                    subjects: formData.subjects,
                    slug: formData.slug || null,
                });

            if (tutorError) {
                if (tutorError.code === '23505') { // Unique violation
                    throw new Error("This Platform URL is already taken. Please choose another.");
                }
                throw tutorError;
            }

            toast.success('Profile updated successfully');
            if (onUpdate) onUpdate();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const FormContent = (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border border-slate-200">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="bg-slate-100 text-slate-500"><UserIcon className="h-12 w-12" /></AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Change Avatar
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="slug" className="text-slate-700 font-bold">Platform URL (Your Brand)</Label>
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-100 border border-slate-300 px-3 py-2 rounded-md text-slate-500 flex items-center select-none text-sm">
                            <Globe className="h-4 w-4 mr-2" />
                            https://
                        </div>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            placeholder="your-brand-name"
                            className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 flex-1 font-medium"
                        />
                        <div className="bg-slate-100 border border-slate-300 px-3 py-2 rounded-md text-slate-500 select-none text-sm">
                            .platform.com
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">This will be your dedicated website address (e.g., https://mr-smith.platform.com).</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="full_name" className="text-slate-700">Full Name</Label>
                    <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Your Name"
                        className="bg-white border-slate-200 text-slate-900 focus:border-blue-500"
                    />
                </div>






                <div className="space-y-3">
                    <Label className="text-slate-700">Subjects</Label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SUBJECTS.map((subject) => {
                            const isSelected = formData.subjects.includes(subject);
                            return (
                                <div
                                    key={subject}
                                    onClick={() => {
                                        const updated = isSelected
                                            ? formData.subjects.filter(s => s !== subject)
                                            : [...formData.subjects, subject];
                                        setFormData({ ...formData, subjects: updated });
                                    }}
                                    className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border transition-colors ${isSelected
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    {subject}
                                </div>
                            );
                        })}
                    </div>
                </div>


            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading || uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );

    if (embedded) {
        return FormContent;
    }

    return (
        <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-slate-900">Edit Profile</CardTitle>
                <CardDescription className="text-slate-500">Update your public profile and platform details</CardDescription>
            </CardHeader>
            <CardContent>
                {FormContent}
            </CardContent>
        </Card>
    );
}
