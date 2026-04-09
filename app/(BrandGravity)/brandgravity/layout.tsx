import Link from "next/link";

export default function BrandGravityLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/brandgravity" className="text-sm font-bold tracking-tight">
                        Brand <span className="text-amber-500">Gravity</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/brandgravity/services" className="text-sm text-neutral-400 hover:text-white transition">
                            서비스
                        </Link>
                        <Link
                            href="/brandgravity/apply"
                            className="text-sm px-4 py-1.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition"
                        >
                            신청하기
                        </Link>
                    </div>
                </div>
            </nav>
            {children}
        </>
    );
}
