"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";

export function MyVerseFooter() {
    return (
        <footer className="border-t border-neutral-100">
            <div className="mx-auto max-w-2xl px-6 py-10 border-b border-neutral-100">
                <NewsletterSubscribeForm
                    source="myverse"
                    accentColor="#6366f1"
                    title="Myverse 뉴스레터"
                    subtitle="새 기능·릴리즈·월간 인사이트를 이메일로 받아보세요."
                />
            </div>
            <div className="py-8 px-6 text-center">
                <p className="text-xs text-neutral-400">
                    &copy; Myverse. Powered by <a href="https://tenone.biz" className="hover:text-neutral-600 transition-colors">Ten:One&trade; Universe</a>.
                </p>
            </div>
        </footer>
    );
}
