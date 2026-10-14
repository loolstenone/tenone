// 플래너'스 AI › 설정 › 사생활 — Planner's 기준으로 다시 씀 (2026-10-14)
// 예전 화면은 MyVerse 개인 OS용(갤러리·GPS·헬스 자동 수집 동의, myverse.kr 공개 페이지, '흔적')이라 Planner's와 맞지 않았다
// 여기서는: 내 기록은 나만 · 인공지능 처리 고지(국외 이전) · 연결한 AI · 데이터 권리(내려받기·계정)
// ⚠️ 문구는 개인정보처리방침과 맞춰야 한다 (공개 전 처리방침 갱신 — app/(Planners)/CLAUDE.md)

import Link from "next/link";
import { Lock, Sparkles, Plug, Download, UserCog } from "lucide-react";
import { SettingsLayout } from "@/features/myverse/planner/SettingsLayout";

export default function PlannersPrivacyPage() {
    return (
        <SettingsLayout>
            <div className="mx-auto max-w-3xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 myverse-dark:text-neutral-100">사생활</h1>
                    <p className="mt-2 break-keep text-sm leading-relaxed text-neutral-500">내 플래너에 무엇이 남고, 어디로 가고, 어떻게 지울 수 있는지 알려 드려요.</p>
                </div>

                <Card icon={<Lock className="h-5 w-5" />} title="내 기록은 나만 봐요">
                    <p>할 일·일정·메모·회고·프로젝트는 내 계정에만 저장되고, 다른 사람에게 보이는 공개 페이지는 없어요. 운영사(Ten:One™)도 문의 처리나 법에서 정한 경우가 아니면 열어 보지 않아요.</p>
                </Card>

                <Card icon={<Sparkles className="h-5 w-5" />} title="인공지능 기능을 쓸 때">
                    <ul className="list-disc space-y-1.5 pl-5">
                        <li>생각 쏟아내기, 오늘의 Top 3, 저녁 회고, 한 주 읽기, 목표 쪼개기, AI로 찾기, 손글씨 읽기를 누를 때만 그 일에 필요한 기록을 인공지능(Anthropic, 미국)에 보내 처리해요. 누르지 않으면 보내지 않아요.</li>
                        <li>사진과 손글씨 그림은 읽은 뒤 저장하지 않아요. 남는 것은 내가 고른 글자뿐이에요.</li>
                        <li>인공지능이 만든 결과(Top 3, 회고 질문, 주간 읽기)는 내 플래너에 저장되고, 언제든 지우거나 고칠 수 있어요.</li>
                    </ul>
                </Card>

                <Card icon={<Plug className="h-5 w-5" />} title="내 AI에 연결했을 때">
                    <p>Claude·ChatGPT 같은 내 AI에 연결하면, 그 AI가 대화 중에 요청한 기록만 그 서비스로 전달되고 그 뒤 처리는 해당 서비스의 정책을 따라요. 연결한 AI가 할 수 있는 일은 읽기와 할 일 추가뿐이에요.</p>
                    <Link href="/planners/app/settings/tech" className="mt-3 inline-block text-sm font-bold text-[var(--pp-accent)] hover:underline">연결한 AI 보기·끊기 →</Link>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card icon={<Download className="h-5 w-5" />} title="내 데이터 내려받기">
                        <p>내 플래너 기록을 한 파일(JSON)로 받을 수 있어요.</p>
                        <a href="/planners/app/settings/privacy/export" className="mt-3 inline-block text-sm font-bold text-[var(--pp-accent)] hover:underline">내려받기 →</a>
                    </Card>
                    <Card icon={<UserCog className="h-5 w-5" />} title="계정과 탈퇴">
                        <p>이 서비스만 그만두거나 계정 전체를 지울 수 있어요. 탈퇴하면 플래너 기록은 지체 없이 지워요(법에서 보관하라고 정한 기록만 그 기간 동안 따로 보관).</p>
                        <Link href="/planners/my" className="mt-3 inline-block text-sm font-bold text-[var(--pp-accent)] hover:underline">내 계정으로 →</Link>
                    </Card>
                </div>
            </div>
        </SettingsLayout>
    );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <section className="border border-neutral-200 bg-white p-6 md:p-8 myverse-dark:border-white/10 myverse-dark:bg-white/5">
            <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 myverse-dark:text-neutral-100">
                <span className="text-[var(--pp-accent)]">{icon}</span> {title}
            </h2>
            <div className="mt-3 break-keep text-sm leading-relaxed text-neutral-600 myverse-dark:text-neutral-400">{children}</div>
        </section>
    );
}
