import Link from "next/link";

export default function PlannerNotFound() {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#0F766E] mb-4">404</p>
            <h1 className="font-serif text-3xl text-neutral-900 mb-3">페이지를 찾을 수 없습니다</h1>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <Link
                href="/planners"
                className="inline-block bg-[#0F766E] text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
            >
                Planner&apos;s 홈으로
            </Link>
        </div>
    );
}
