"use client";

/**
 * 인재 제안 화면 공용 부품 — 칩 선택·이력서 읽기 보기
 * 색 규약(app/(HeRo)/CLAUDE.md): 선택된 칩 = State(bg-red-50 text-[#E53935]), 나머지 중립
 */
import clsx from "clsx";
import type { ResumeContent } from "@/types/resume";

export function ChipPick({ options, values, onChange, max }: {
    options: readonly (string | { v: string; l: string })[];
    values: string[];
    onChange: (next: string[]) => void;
    max?: number;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(o => {
                const v = typeof o === "string" ? o : o.v;
                const l = typeof o === "string" ? o : o.l;
                const on = values.includes(v);
                const disabled = !on && !!max && values.length >= max;
                return (
                    <button key={v} type="button" disabled={disabled}
                        onClick={() => onChange(on ? values.filter(x => x !== v) : [...values, v])}
                        className={clsx(
                            "px-3 py-1.5 rounded-none text-sm border transition-colors",
                            on ? "bg-red-50 border-[#E53935] text-[#E53935] font-bold"
                                : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400",
                            disabled && "opacity-40 cursor-not-allowed hover:border-neutral-200",
                        )}>
                        {l}
                    </button>
                );
            })}
        </div>
    );
}

export function ChipSingle({ options, value, onChange }: {
    options: readonly (string | { v: string; l: string })[];
    value: string;
    onChange: (v: string) => void;
}) {
    return <ChipPick options={options} values={value ? [value] : []} onChange={next => onChange(next.filter(x => x !== value)[0] ?? "")} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-sm font-bold text-neutral-900 mb-1">{label}</p>
            {hint && <p className="text-xs text-neutral-500 mb-2">{hint}</p>}
            {children}
        </div>
    );
}

export function ResumeReadView({ title, content, fileUrl }: { title?: string | null; content: ResumeContent | null; fileUrl?: string | null }) {
    const c = content ?? {};
    const period = (s?: string, e?: string, cur?: boolean) => [s, cur ? "현재" : e].filter(Boolean).join(" ~ ");
    return (
        <div className="space-y-5 text-sm">
            {title && <p className="font-bold text-base">{title}</p>}
            {(c.headline || c.desired_job) && (
                <div>
                    {c.headline && <p className="font-bold">{c.headline}</p>}
                    {c.desired_job && <p className="text-neutral-500">희망 직무: {c.desired_job}</p>}
                </div>
            )}
            {c.summary && <p className="whitespace-pre-line text-neutral-700 leading-relaxed">{c.summary}</p>}
            {!!c.experiences?.length && (
                <Section title="경력">
                    {c.experiences.map((x, i) => (
                        <div key={i}>
                            <p className="font-bold">{x.company} · {x.role}</p>
                            <p className="text-xs text-neutral-500">{period(x.start, x.end, x.current)}</p>
                            {x.description && <p className="mt-1 whitespace-pre-line text-neutral-700">{x.description}</p>}
                        </div>
                    ))}
                </Section>
            )}
            {!!c.educations?.length && (
                <Section title="학력">
                    {c.educations.map((x, i) => (
                        <p key={i}><span className="font-bold">{x.school}</span> {x.major} <span className="text-xs text-neutral-500">{period(x.start, x.end)} {x.status}</span></p>
                    ))}
                </Section>
            )}
            {!!c.activities?.length && (
                <Section title="활동">
                    {c.activities.map((x, i) => (
                        <div key={i}>
                            <p className="font-bold">{x.name}{x.org && ` · ${x.org}`}</p>
                            <p className="text-xs text-neutral-500">{period(x.start, x.end)}</p>
                            {x.description && <p className="mt-1 whitespace-pre-line text-neutral-700">{x.description}</p>}
                        </div>
                    ))}
                </Section>
            )}
            {!!c.certifications?.length && (
                <Section title="자격·어학">
                    {c.certifications.map((x, i) => <p key={i}>{x.name} {x.score} <span className="text-xs text-neutral-500">{x.issuer} {x.date}</span></p>)}
                </Section>
            )}
            {!!c.skills?.length && (
                <Section title="기술">
                    <div className="flex flex-wrap gap-1.5">{c.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-none bg-neutral-100 text-neutral-600 text-xs">{s}</span>)}</div>
                </Section>
            )}
            {!!c.links?.length && (
                <Section title="링크">
                    {c.links.map((x, i) => <a key={i} href={x.url} target="_blank" rel="noopener noreferrer" className="block text-neutral-700 underline break-all">{x.label || x.url}</a>)}
                </Section>
            )}
            {c.text && <p className="whitespace-pre-line text-neutral-700 leading-relaxed">{c.text}</p>}
            {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold underline">첨부 파일 열기</a>}
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-bold text-neutral-500 mb-2">{title}</p>
            <div className="space-y-3">{children}</div>
        </div>
    );
}
