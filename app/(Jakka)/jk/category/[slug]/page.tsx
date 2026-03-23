"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const categoryData: Record<string, {
    title: string;
    description: string;
    photos: { src: string; caption: string }[];
}> = {
    portrait: {
        title: "인물 사진",
        description: "사람의 감정과 이야기를 렌즈에 담습니다.",
        photos: [
            { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop", caption: "Portrait I" },
            { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=750&fit=crop", caption: "Portrait II" },
            { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=750&fit=crop", caption: "Portrait III" },
            { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop", caption: "Portrait IV" },
            { src: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&h=750&fit=crop", caption: "Portrait V" },
            { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop", caption: "Portrait VI" },
        ],
    },
    studio: {
        title: "스튜디오",
        description: "통제된 빛과 공간에서 만들어내는 완벽한 이미지.",
        photos: [
            { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop", caption: "Studio I" },
            { src: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=600&fit=crop", caption: "Studio II" },
            { src: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&h=600&fit=crop", caption: "Studio III" },
            { src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop", caption: "Studio IV" },
            { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", caption: "Studio V" },
            { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop", caption: "Studio VI" },
        ],
    },
    sports: {
        title: "스포츠",
        description: "역동적인 순간을 정지시키는 스포츠 포토그래피.",
        photos: [
            { src: "https://images.unsplash.com/photo-1461896836934-bd45ba8b2cda?w=600&h=450&fit=crop", caption: "Sports I" },
            { src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=450&fit=crop", caption: "Sports II" },
            { src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=450&fit=crop", caption: "Sports III" },
            { src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=450&fit=crop", caption: "Sports IV" },
            { src: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=450&fit=crop", caption: "Sports V" },
            { src: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=600&h=450&fit=crop", caption: "Sports VI" },
        ],
    },
    aerial: {
        title: "항공 사진",
        description: "하늘에서 바라본 새로운 시점의 세계.",
        photos: [
            { src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=450&fit=crop", caption: "Aerial I" },
            { src: "https://images.unsplash.com/photo-1488747279002-c8523379faaa?w=600&h=450&fit=crop", caption: "Aerial II" },
            { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop", caption: "Aerial III" },
            { src: "https://images.unsplash.com/photo-1494587416117-f102a2ac0a8d?w=600&h=450&fit=crop", caption: "Aerial IV" },
            { src: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=600&h=450&fit=crop", caption: "Aerial V" },
            { src: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=600&h=450&fit=crop", caption: "Aerial VI" },
        ],
    },
    winter: {
        title: "겨울",
        description: "고요한 겨울 풍경 속 차가운 아름다움.",
        photos: [
            { src: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&h=450&fit=crop", caption: "Winter I" },
            { src: "https://images.unsplash.com/photo-1457269449834-928af64c684d?w=600&h=450&fit=crop", caption: "Winter II" },
            { src: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&h=450&fit=crop", caption: "Winter III" },
            { src: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&h=450&fit=crop", caption: "Winter IV" },
            { src: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&h=450&fit=crop", caption: "Winter V" },
            { src: "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=600&h=450&fit=crop", caption: "Winter VI" },
        ],
    },
    ocean: {
        title: "바다",
        description: "끝없는 수평선과 파도의 리듬.",
        photos: [
            { src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=450&fit=crop", caption: "Ocean I" },
            { src: "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=600&h=450&fit=crop", caption: "Ocean II" },
            { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=450&fit=crop", caption: "Ocean III" },
            { src: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?w=600&h=450&fit=crop", caption: "Ocean IV" },
            { src: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=600&h=450&fit=crop", caption: "Ocean V" },
            { src: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&h=450&fit=crop", caption: "Ocean VI" },
        ],
    },
    shadow: {
        title: "그림자",
        description: "빛과 그림자가 만들어내는 추상의 미학.",
        photos: [
            { src: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=600&h=450&fit=crop", caption: "Shadow I" },
            { src: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&h=450&fit=crop", caption: "Shadow II" },
            { src: "https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?w=600&h=450&fit=crop", caption: "Shadow III" },
            { src: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=450&fit=crop", caption: "Shadow IV" },
            { src: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&h=450&fit=crop", caption: "Shadow V" },
            { src: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=600&h=450&fit=crop", caption: "Shadow VI" },
        ],
    },
    concert: {
        title: "콘서트",
        description: "음악과 열정이 만나는 라이브 무대.",
        photos: [
            { src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=450&fit=crop", caption: "Concert I" },
            { src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=450&fit=crop", caption: "Concert II" },
            { src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=450&fit=crop", caption: "Concert III" },
            { src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&h=450&fit=crop", caption: "Concert IV" },
            { src: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=450&fit=crop", caption: "Concert V" },
            { src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=450&fit=crop", caption: "Concert VI" },
        ],
    },
};

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const data = categoryData[slug];

    if (!data) {
        return (
            <section className="py-20 text-center">
                <p className="text-neutral-500">카테고리를 찾을 수 없습니다.</p>
                <Link href="/jk" className="mt-4 inline-block text-sm text-neutral-900 underline">
                    돌아가기
                </Link>
            </section>
        );
    }

    return (
        <section className="py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* 뒤로가기 + 타이틀 */}
                <div className="mb-10">
                    <Link
                        href="/jk"
                        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        포트폴리오
                    </Link>
                    <h1 className="text-3xl font-light tracking-tight text-neutral-900">
                        {data.title}
                    </h1>
                    <p className="mt-2 text-neutral-500 text-sm">{data.description}</p>
                </div>

                {/* 사진 그리드 (3열) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.photos.map((photo, i) => (
                        <div key={i} className="group relative overflow-hidden bg-neutral-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={photo.src}
                                alt={photo.caption}
                                className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            {/* 호버 오버레이 */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
                                <span className="text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {photo.caption}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
