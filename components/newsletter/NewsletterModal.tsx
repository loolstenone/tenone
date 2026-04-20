"use client";

import { X } from "lucide-react";
import NewsletterSubscribeForm from "./NewsletterSubscribeForm";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    source: string;
    title?: string;
    subtitle?: string;
    accentColor?: string;
    dark?: boolean;
}

export default function NewsletterModal({
    isOpen, onClose, source, title, subtitle, accentColor = "#171717", dark = false,
}: Props) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-start md:items-center justify-center overflow-y-auto p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative w-full max-w-md ${dark ? "bg-neutral-950 border border-neutral-800" : "bg-white"}`}>
                <button
                    onClick={onClose}
                    className={`absolute top-3 right-3 z-10 p-1.5 ${dark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"}`}
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="p-6">
                    <NewsletterSubscribeForm
                        source={source}
                        title={title}
                        subtitle={subtitle}
                        accentColor={accentColor}
                        dark={dark}
                    />
                </div>
            </div>
        </div>
    );
}
