"use client";

import Link from "next/link";

const categories = [
    {
        slug: "portrait",
        title: "인물 사진",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=600&fit=crop",
    },
    {
        slug: "studio",
        title: "스튜디오",
        image: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&h=600&fit=crop",
    },
    {
        slug: "sports",
        title: "스포츠",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop",
    },
    {
        slug: "aerial",
        title: "항공 사진",
        image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop",
    },
    {
        slug: "winter",
        title: "겨울",
        image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&h=600&fit=crop",
    },
    {
        slug: "ocean",
        title: "바다",
        image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop",
    },
    {
        slug: "shadow",
        title: "그림자",
        image: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=800&h=600&fit=crop",
    },
    {
        slug: "concert",
        title: "콘서트",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    },
];

export default function JakkaHomePage() {
    return (
        <section className="py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* 2열 그리드 갤러리 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    {categories.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/jk/category/${cat.slug}`}
                            className="group block"
                        >
                            <div className="overflow-hidden bg-neutral-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            <p className="mt-3 text-center text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                                {cat.title}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
