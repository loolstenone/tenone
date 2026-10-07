import Link from "next/link";
import { listProgramForms } from "@/lib/forms-server";
import { AVAILABILITY_LABEL } from "@/lib/forms";

/**
 * 프로그램 페이지의 "참가 신청" 버튼 묶음 — 인트라에서 프로그램 키(program)로 만든 폼이 자동으로 붙는다.
 * 열린 폼 = 빨간 버튼, 마감 = 회색. 공개 폼이 없으면 fallback(예: 일정 공지 예정) 표시
 */
export async function ProgramForms({ program, fallback }: { program: string; fallback?: React.ReactNode }) {
    const forms = await listProgramForms("madleague", program);
    if (forms.length === 0) return <>{fallback ?? null}</>;
    return (
        <div className="flex flex-wrap gap-3">
            {forms.map(f => (
                <Link key={f.slug} href={`/madleague/forms/${f.slug}`}
                    className={`inline-flex items-center gap-3 px-8 py-4 text-lg font-bold transition ${f.availability === "open" ? "bg-black text-white hover:bg-neutral-900" : "bg-black/30 text-white/60"}`}>
                    {f.title}
                    <span className="text-xs font-bold tracking-widest opacity-70">{AVAILABILITY_LABEL[f.availability]}</span>
                </Link>
            ))}
        </div>
    );
}
