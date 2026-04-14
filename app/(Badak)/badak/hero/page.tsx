import Link from 'next/link';

export default function HeroPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white pt-14">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-neutral-900">HeRo 채용</h1>
                <p className="text-neutral-500">준비 중입니다</p>
                <Link href="/badak" className="inline-block mt-4 px-6 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors">
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    );
}
