"use client";

const artists = [
    { id: 1, name: "미연", role: "Visual Artist", specialty: "비주얼 아트, 패션", emoji: "👩‍🎨", bio: "트렌디한 비주얼과 패션 이미지를 전문으로 합니다." },
    { id: 2, name: "하은", role: "Character Designer", specialty: "캐릭터, 일러스트", emoji: "✏️", bio: "독창적인 캐릭터 디자인과 일러스트레이션을 담당합니다." },
    { id: 3, name: "수아", role: "Fashion AI", specialty: "패션, 화보", emoji: "👗", bio: "패션 화보와 스타일링 콘텐츠를 제작합니다." },
    { id: 4, name: "지우", role: "Portrait Artist", specialty: "인물, 초상화", emoji: "🖼️", bio: "인물 사진과 초상화 스타일의 AI 아트를 그립니다." },
    { id: 5, name: "다인", role: "K-Girl Group", specialty: "아이돌, 퍼포먼스", emoji: "💃", bio: "K-POP 스타일의 아이돌 비주얼을 담당합니다." },
    { id: 6, name: "세라", role: "Concept Artist", specialty: "컨셉 아트, 세계관", emoji: "🎭", bio: "독특한 세계관과 컨셉 아트를 만들어냅니다." },
    { id: 7, name: "유진", role: "Classical AI", specialty: "클래식, 명화", emoji: "🎵", bio: "클래식 명화의 AI 재해석을 전문으로 합니다." },
    { id: 8, name: "민서", role: "Digital Human", specialty: "디지털 휴먼, 모션", emoji: "🤖", bio: "실사 수준의 디지털 휴먼을 구현합니다." },
    { id: 9, name: "하나", role: "Photo Artist", specialty: "포토리얼, 풍경", emoji: "📷", bio: "포토리얼리스틱 풍경과 감성 사진을 제작합니다." },
];

export default function RooKArtistPage() {
    return (
        <div className="py-12 px-6">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-4xl font-bold mb-2">AI Artist</h1>
                <p className="text-neutral-600 mb-10">
                    루크 소속 인공지능 모델들입니다. 당신의 브랜드와 콘텐츠를 위해서라면 최선을 다합니다.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists.map((artist) => (
                        <div
                            key={artist.id}
                            className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#00d255] transition-all"
                        >
                            <div className="aspect-[4/5] bg-neutral-100 flex items-center justify-center">
                                <span className="text-8xl">{artist.emoji}</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-bold group-hover:text-[#00d255] transition-colors">{artist.name}</h3>
                                <p className="text-sm text-[#00d255] font-medium mt-1">{artist.role}</p>
                                <p className="text-sm text-neutral-500 mt-1">{artist.specialty}</p>
                                <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{artist.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
