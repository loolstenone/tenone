// MADLeap study-room — Server Component
// 운영진이 Intra UMS에서 madleap_study_programs 테이블에 직접 입력.
// 빈 DB일 때는 "운영 중 스터디 없음" 표시 (정직성 회복).

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import StudyRoomList, { type StudyProgram } from "@/features/madleap/StudyRoomList";

export const revalidate = 300;

async function fetchStudyPrograms(): Promise<StudyProgram[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("madleap_study_programs")
        .select("id, title, description, icon_name, tags, capacity, current_count, schedule, day_label, leader_name, leader_school, status, semester, curriculum")
        .eq("is_published", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[madleap/study-room] fetch failed:", error.message);
        return [];
    }
    return (data ?? []) as StudyProgram[];
}

export default async function MadLeapStudyRoomPage() {
    const studies = await fetchStudyPrograms();
    const openCount = studies.filter((s) => s.status === "recruiting").length;
    const totalMembers = studies.reduce((sum, s) => sum + (s.current_count ?? 0), 0);

    return (
        <>
            {/* Hero */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3">Study Room</p>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">함께 공부하고, 함께 성장합니다</h1>
                    {studies.length > 0 ? (
                        <p className="text-neutral-400">
                            현재 {studies.length}개 스터디 운영{openCount > 0 ? ` · ${openCount}개 모집중` : ""}
                        </p>
                    ) : (
                        <p className="text-neutral-400">5기 모집 후 스터디 운영이 시작됩니다</p>
                    )}

                    {studies.length > 0 && (
                        <div className="flex items-center justify-center gap-8 mt-8">
                            <div className="text-center">
                                <div className="text-2xl font-black text-[#4361ee]">{studies.length}</div>
                                <div className="text-xs text-neutral-400">스터디</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-black text-[#4361ee]">{totalMembers}</div>
                                <div className="text-xs text-neutral-400">참여 중</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-black text-green-400">{openCount}</div>
                                <div className="text-xs text-neutral-400">모집중</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Study List */}
            <section className="py-12 md:py-20">
                <div className="mx-auto max-w-5xl px-6">
                    {studies.length > 0 ? (
                        <StudyRoomList items={studies} />
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-neutral-500 text-sm mb-2">현재 운영 중인 스터디가 없습니다.</p>
                            <p className="text-neutral-400 text-xs">정규 기수 모집 시 스터디 운영이 함께 시작됩니다.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* How to Join */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-4xl px-6">
                    <h2 className="text-xl md:text-2xl font-bold text-center mb-4">스터디 참여 방법</h2>
                    <p className="text-neutral-500 text-center text-sm mb-10">매드립 리퍼라면 누구나 스터디에 참여할 수 있습니다</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { step: "01", title: "매드립 가입", desc: "정규 기수 모집을 통해 리퍼가 됩니다" },
                            { step: "02", title: "스터디 탐색", desc: "관심 분야 스터디의 커리큘럼을 확인합니다" },
                            { step: "03", title: "신청", desc: "'스터디 신청하기' 버튼으로 바로 신청" },
                            { step: "04", title: "함께 성장", desc: "정기 모임에 참여하며 실력을 키웁니다" },
                        ].map((item) => (
                            <div key={item.step} className="bg-white p-6 rounded-xl border border-neutral-200 text-center">
                                <div className="text-2xl font-black text-[#4361ee] mb-2">{item.step}</div>
                                <h3 className="font-semibold mb-1">{item.title}</h3>
                                <p className="text-xs text-neutral-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-sm text-neutral-500 mb-4">아직 매드립 리퍼가 아니라면?</p>
                        <Link
                            href="/madleap/apply"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#1a1a2e]/90 transition-colors"
                        >
                            5기 지원하기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
