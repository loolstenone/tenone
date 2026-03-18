import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 flex flex-col">
            <PublicHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
