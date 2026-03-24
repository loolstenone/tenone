"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
    previewSize?: "sm" | "md" | "lg";
    storagePath?: string; // e.g. "sites/tenone/posts"
}

export function ImageUploader({
    value,
    onChange,
    label = "이미지 업로드",
    accept = "image/png,image/jpeg,image/webp,image/svg+xml",
    maxSizeMB = 5,
    previewSize = "md",
    storagePath = "uploads",
}: ImageUploaderProps) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const sizeClass = {
        sm: "h-24 w-24",
        md: "h-40 w-full",
        lg: "h-60 w-full",
    }[previewSize];

    const handleFile = useCallback(async (file: File) => {
        setError("");
        if (!file.type.startsWith("image/")) {
            setError("이미지 파일만 업로드 가능합니다.");
            return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
            return;
        }

        setUploading(true);
        try {
            const supabase = createClient();
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `${storagePath}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

            const { data, error: uploadError } = await supabase.storage
                .from('bums-assets')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                // Storage 버킷이 없거나 권한 문제 → base64 fallback
                console.warn('[ImageUploader] Storage upload failed, using base64:', uploadError.message);
                const reader = new FileReader();
                reader.onload = (e) => onChange(e.target?.result as string);
                reader.readAsDataURL(file);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('bums-assets')
                .getPublicUrl(data.path);

            onChange(publicUrl);
            console.log('[ImageUploader] Uploaded to Storage:', publicUrl);
        } catch (err) {
            // 완전 실패 시 base64 fallback
            console.warn('[ImageUploader] Upload error, using base64:', err);
            const reader = new FileReader();
            reader.onload = (e) => onChange(e.target?.result as string);
            reader.readAsDataURL(file);
        } finally {
            setUploading(false);
        }
    }, [onChange, maxSizeMB, storagePath]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>

            {value ? (
                <div className={`relative ${sizeClass} rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50`}>
                    <img src={value} alt="preview" className="w-full h-full object-contain" />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`${sizeClass} rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
                        uploading
                            ? "border-neutral-300 bg-neutral-100 cursor-wait"
                            : dragging
                                ? "border-blue-400 bg-blue-50 cursor-pointer"
                                : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 cursor-pointer"
                    }`}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-neutral-400 mb-2 animate-spin" />
                            <p className="text-sm text-neutral-500">업로드 중...</p>
                        </>
                    ) : dragging ? (
                        <>
                            <Upload className="h-8 w-8 text-blue-400 mb-2" />
                            <p className="text-sm text-neutral-500">여기에 놓으세요</p>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-8 w-8 text-neutral-400 mb-2" />
                            <p className="text-sm text-neutral-500">클릭 또는 드래그하여 업로드</p>
                            <p className="text-xs text-neutral-400 mt-1">PNG, JPG, WebP, SVG (최대 {maxSizeMB}MB)</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
