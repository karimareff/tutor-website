'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, File as FileIcon, X, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface FileUploadProps {
    bucket: string;
    path?: string; // Optional folder path prefix
    onUploadComplete: (url: string) => void;
    label?: string;
    acceptedFileTypes?: string;
    existingUrl?: string;
}

export default function FileUpload({
    bucket,
    path = "",
    onUploadComplete,
    label = "Upload File",
    acceptedFileTypes = ".pdf,.doc,.docx,.png,.jpg,.jpeg",
    existingUrl
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(existingUrl || null);

    // Sync with parent's existingUrl when it changes
    useEffect(() => {
        setFileUrl(existingUrl || null);
    }, [existingUrl]);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${path}${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    upsert: true // Allow replacing existing files
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setFileUrl(data.publicUrl);
            onUploadComplete(data.publicUrl);
            toast.success("File uploaded successfully");

        } catch (error: any) {
            console.error("Error uploading file:", error);
            toast.error(error.message || "Error uploading file");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFileUrl(null);
        onUploadComplete(""); // Clear parent state
    };

    return (
        <div className="grid w-full items-center gap-2">
            <Label htmlFor="file-upload">{label}</Label>

            {!fileUrl ? (
                <div className="flex items-center gap-2">
                    <Input
                        id="file-upload"
                        type="file"
                        accept={acceptedFileTypes}
                        onChange={handleUpload}
                        disabled={uploading}
                        className="cursor-pointer file:cursor-pointer"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon className="h-5 w-5 text-blue-500 shrink-0" />
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate max-w-[200px] sm:max-w-[300px]"
                        >
                            View Uploaded File
                        </a>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-2 shrink-0" />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        className="text-slate-500 hover:text-red-500 h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
