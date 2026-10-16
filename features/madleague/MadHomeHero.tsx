/**
 * MAD League 홈 첫 화면 (2026-10-16 사용자 결정 A안 — "AI로 만든 느낌" 개선)
 * 그라데이션·빛 번짐·영문 머리말 없음. 슬라이딩 카피(HeroRotatingTitle)는 유지 (사용자 지시 "처음처럼 슬라이딩").
 * 사진 = DAM 파티 시즌 2 발표 장면에 헬멧을 합성한 콘셉트 이미지 — 이 화면에만 쓴다 (사용자 지시 "반복 사용하지 마"), 사진 설명 문구 없음 (사용자 지시)
 */
import Image from 'next/image';
import Link from 'next/link';
import { HeroRotatingTitle } from '@/features/madleague/HeroRotatingTitle';
import { MAD_PROGRAM_IMAGES } from '@/lib/madleague-program-assets';

export function MadHomeHero() {
    return (
        <section className="bg-black text-white">
            <div className="mx-auto max-w-7xl px-6 pt-28 pb-24 sm:pt-36 grid gap-14 lg:grid-cols-[1fr_minmax(0,600px)] lg:items-center">
                <div>
                    <HeroRotatingTitle sizeClass="text-[2.5rem] sm:text-6xl xl:text-7xl" />
                    <p className="mt-8 max-w-xl text-lg text-neutral-300 leading-relaxed break-keep">
                        전국 마케팅·광고 동아리가 실제 기업의 과제를 받아 기획하고, 기업 앞에서 발표합니다.
                        <span className="block mt-2 font-bold text-white">경력 같은 신입의 무대, 매드리그</span>
                    </p>
                    <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link href="/madleague/apply" className="bg-[#EC1D25] hover:bg-[#d01820] px-8 py-4 font-bold text-white transition-colors">
                            매드리거 등록
                        </Link>
                        <Link href="/madleague/programs/competition" className="font-bold underline underline-offset-8 decoration-white/40 hover:decoration-white">
                            경쟁 PT 알아보기
                        </Link>
                    </div>
                </div>
                <div className="relative aspect-[4/3] w-full">
                    <Image src={MAD_PROGRAM_IMAGES.damTalkHelmet} alt="MAD League 헬멧을 쓰고 발표를 듣는 매드리거들" fill priority
                        sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
                </div>
            </div>
        </section>
    );
}
