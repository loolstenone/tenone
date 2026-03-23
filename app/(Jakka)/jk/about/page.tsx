"use client";

export default function JakkaAboutPage() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
                    {/* 프로필 사진 */}
                    <div className="relative overflow-hidden bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=1000&fit=crop"
                            alt="JAKKA 프로필"
                            className="w-full aspect-[3/4] object-cover"
                        />
                        <p className="absolute bottom-0 left-0 bg-white/90 px-3 py-1.5 text-xs text-neutral-600">
                            자화상
                        </p>
                    </div>

                    {/* 소개 텍스트 */}
                    <div>
                        <h1 className="text-3xl font-light tracking-tight text-neutral-900 mb-6">
                            안녕하세요
                        </h1>
                        <div className="space-y-4 text-sm text-neutral-600 leading-relaxed">
                            <p>
                                사진작가 JAKKA입니다. 인물, 스포츠, 항공, 콘서트 등
                                다양한 장르의 사진을 촬영하고 있습니다.
                            </p>
                            <p>
                                순간의 감정과 에너지를 렌즈에 담아
                                보는 이에게 그 순간을 전달하는 것이 제 작업의 목표입니다.
                            </p>
                            <p>
                                촬영 문의나 협업 제안은 아래 연락처로 보내주세요.
                            </p>
                        </div>

                        {/* 연락처 */}
                        <div className="mt-10 pt-6 border-t border-neutral-200">
                            <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">
                                Contact
                            </h2>
                            <div className="space-y-2 text-sm text-neutral-600">
                                <p>
                                    <span className="text-neutral-400 mr-2">Email</span>
                                    lools@tenone.biz
                                </p>
                                <p>
                                    <span className="text-neutral-400 mr-2">Instagram</span>
                                    @jakka_photo
                                </p>
                            </div>
                        </div>

                        {/* 장비 */}
                        <div className="mt-8 pt-6 border-t border-neutral-200">
                            <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">
                                Equipment
                            </h2>
                            <div className="space-y-1 text-sm text-neutral-500">
                                <p>Nikon Z9</p>
                                <p>Nikon Z 24-70mm f/2.8 S</p>
                                <p>Nikon Z 70-200mm f/2.8 VR S</p>
                                <p>DJI Mavic 3 Pro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
