"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
    previewSize?: "sm" | "md" | "lg";
}

export function ImageUploader({
    value,
    onChange,
    label = "이미지 업로드",
    accept = "image/png,image/jpeg,image/webp,image/svg+xml",
    maxSizeMB = 5,
    previewSize = "md",
}: ImageUploaderProps) {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const sizeClass = {
        sm: "h-24 w-24",
        md: "h-40 w-full",
        lg: "h-60 w-full",
    }[previewSize];

    const handleFile = useCallback((file: File) => {
        setError("");
        if (!file.type.startsWith("image/")) {
            setError("이미지 파일만 업로드 가능합니다.");
            return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
            return;
        }
        // base64로 변환 (추후 Supabase Storage로 교체)
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [onChange, maxSizeMB]);

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
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`${sizeClass} rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        dragging
                            ? "border-blue-400 bg-blue-50"
                            : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100"
                    }`}
                >
                    {dragging ? (
                        <Upload className="h-8 w-8 text-blue-400 mb-2" />
                    ) : (
                        <ImageIcon className="h-8 w-8 text-neutral-400 mb-2" />
                    )}
                    <p className="text-sm text-neutral-500">
                        {dragging ? "여기에 놓으세요" : "클릭 또는 드래그하여 업로드"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">PNG, JPG, WebP, SVG (최대 {maxSizeMB}MB)</p>
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
