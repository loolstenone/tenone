"use client";

import Link from "next/link";

const categories = [
    { slug: "portrait", title: "인물 사진", description: "사람의 감정과 이야기를 렌즈에 담습니다.", thumb: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=400&fit=crop" },
    { slug: "studio", title: "스튜디오", description: "통제된 빛과 공간에서 만들어내는 완벽한 이미지.", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop" },
    { slug: "sports", title: "스포츠", description: "역동적인 순간을 정지시키는 스포츠 포토그래피.", thumb: "https://images.unsplash.com/photo-1461896836934-bd45ba8b2cda?w=600&h=400&fit=crop" },
    { slug: "aerial", title: "항공 사진", description: "하늘에서 바라본 새로운 시점의 세계.", thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop" },
    { slug: "winter", title: "겨울", description: "고요한 겨울 풍경 속 차가운 아름다움.", thumb: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&h=400&fit=crop" },
    { slug: "ocean", title: "바다", description: "끝없는 수평선과 파도의 리듬.", thumb: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop" },
    { slug: "shadow", title: "그림자", description: "빛과 그림자가 만들어내는 추상의 미학.", thumb: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=600&h=400&fit=crop" },
    { slug: "concert", title: "콘서트", description: "음악과 열정이 만나는 라이브 무대.", thumb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop" },
];

export default function CategoryIndexPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-[22px] font-black tracking-tight text-neutral-900 mb-1">카테고리</h1>
                <p className="text-[13px] text-neutral-500">분야별 작가 작업을 탐색하세요.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/jakka/category/${cat.slug}`}
                        className="group relative overflow-hidden bg-neutral-100 aspect-square"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={cat.thumb}
                            alt={cat.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
                        <div className="absolute inset-0 flex flex-col justify-end p-3">
                            <p className="text-white text-[14px] font-black leading-tight">{cat.title}</p>
                            <p className="text-white/70 text-[11px] mt-0.5 leading-snug hidden group-hover:block">
                                {cat.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
