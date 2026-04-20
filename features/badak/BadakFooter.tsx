"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";

export function BadakFooter() {
    return (
        <footer className="bg-[#1a1a2e] text-neutral-400 border-t border-neutral-800">
            <div className="mx-auto max-w-2xl px-6 py-12">
                <NewsletterSubscribeForm
                    source="badak"
                    dark
                    accentColor="#D32F2F"
                    title="Badak 뉴스레터"
                    subtitle="직무 커뮤니티 소식과 신규 모임을 이메일로 받아보세요."
                />
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
