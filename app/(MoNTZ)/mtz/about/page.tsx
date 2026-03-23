"use client";

import { useState, useEffect } from "react";

export default function MoNTZAbout() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="pt-14">
            <section className="py-16 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* 사진 — 카메라 들고 있는 포토그래퍼 */}
                        <div
                            className={`transition-all duration-700 ${
                                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop"
                                alt="MoNTZ Photographer"
                                className="w-full max-w-lg mx-auto"
                            />
                        </div>

                        {/* 소개 텍스트 */}
                        <div
                            className={`transition-all duration-700 delay-200 ${
                                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                        >
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                                MoNTZ입니다.
                            </h1>
                            <p className="text-lg md:text-xl font-semibold text-neutral-800 leading-relaxed mb-4">
                                자신을 사랑하며 저는 사진을 사랑하며 개인적, 상업적으로 다양한 사진 촬영 작업을 하고 있습니다.
                            </p>
                            <p className="text-sm text-neutral-500 tracking-widest">
                                U.G.L.Y
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
