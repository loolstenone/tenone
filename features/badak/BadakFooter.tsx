"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";

export function BadakFooter() {
    return (
        <footer className="bg-[#1a1a2e] text-neutral-400 border-t border-neutral-800">
            <div className="mx-auto max-w-2xl px-6 py-12">
                <NewsletterSubscribeForm source="badak" brandName="Badak" dark accentColor="#D32F2F" />
            </div>
            <div className="border-t border-neutral-800">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
                    <div className="text-xs text-center">
                        &copy; Badak. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
                    </div>
                </div>
            </div>
        </footer>
    );
}
