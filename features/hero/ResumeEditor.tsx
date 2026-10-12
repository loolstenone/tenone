"use client";

/**
 * HeRo 이력서 편집기 — 항목별 입력 (2026-10-12, 자유 양식 한 칸에서 개편)
 * 기본 정보(이름·이메일·연락처)는 프로필에서 읽어 보여 주고 이력서에 따로 저장하지 않는다 (데이터 계약 1조).
 * 직무와 무관한 정보(사진·나이·가족·출신지)는 받지 않는다 — 채용절차법 제4조의3 취지.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Plus, Trash2, X } from "lucide-react";
import type { ResumeContent, ResumeExperience, ResumeEducation, ResumeActivity, ResumeCertification, ResumeLink } from "@/types/resume";

const input = "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 bg-white";
const label = "text-[13px] font-medium text-neutral-600 mb-1.5 block";

const EMPTY = {
  experiences: { company: "", role: "", start: "", end: "", current: false, description: "" } as ResumeExperience,
  educations: { school: "", major: "", start: "", end: "", status: "졸업" } as ResumeEducation,
  activities: { name: "", org: "", start: "", end: "", description: "" } as ResumeActivity,
  certifications: { name: "", issuer: "", date: "", score: "" } as ResumeCertification,
  links: { label: "", url: "" } as ResumeLink,
};

/** 입력이 하나라도 있는 행만 저장 */
export function cleanResumeContent(c: ResumeContent): ResumeContent {
  const filled = <T extends object>(rows: T[] | undefined) => (rows ?? []).filter(r => Object.entries(r).some(([k, v]) => k !== "current" && k !== "status" && String(v ?? "").trim()));
  return {
    version: 2,
    headline: c.headline?.trim() || undefined,
    desired_job: c.desired_job?.trim() || undefined,
    summary: c.summary?.trim() || undefined,
    experiences: filled(c.experiences),
    educations: filled(c.educations),
    activities: filled(c.activities),
    certifications: filled(c.certifications),
    skills: (c.skills ?? []).map(s => s.trim()).filter(Boolean),
    links: filled(c.links),
    text: c.text?.trim() || undefined,
  };
}

function Card({ title, desc, children, onAdd, addLabel }: { title: string; desc?: string; children: ReactNode; onAdd?: () => void; addLabel?: string }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-[16px] font-bold text-neutral-900">{title}</h2>
      {desc && <p className="text-[13px] text-neutral-500 mt-1 leading-relaxed">{desc}</p>}
      <div className="mt-5 space-y-5">{children}</div>
      {onAdd && (
        <button type="button" onClick={onAdd} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </section>
  );
}

function RowBox({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="relative rounded-xl bg-neutral-50 p-4 pr-11">
      <button type="button" onClick={onRemove} aria-label="이 항목 삭제" className="absolute top-3 right-3 p-1.5 text-neutral-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Period({ start, end, onStart, onEnd, current, onCurrent }: { start: string; end: string; onStart: (v: string) => void; onEnd: (v: string) => void; current?: boolean; onCurrent?: (v: boolean) => void }) {
  return (
    <div className="sm:col-span-2 grid grid-cols-2 gap-3 items-end">
      <div><span className={label}>시작</span><input type="month" value={start} onChange={e => onStart(e.target.value)} className={input} /></div>
      <div>
        <span className={label}>종료</span>
        <input type="month" value={end} disabled={current} onChange={e => onEnd(e.target.value)} className={`${input} disabled:bg-neutral-100 disabled:text-neutral-400`} />
      </div>
      {onCurrent && (
        <label className="col-span-2 inline-flex items-center gap-2 text-[13px] text-neutral-600">
          <input type="checkbox" checked={!!current} onChange={e => onCurrent(e.target.checked)} /> 현재 재직·진행 중
        </label>
      )}
    </div>
  );
}

export default function ResumeEditor({ title, onTitle, content, onContent, profile }: {
  title: string; onTitle: (v: string) => void;
  content: ResumeContent; onContent: (c: ResumeContent) => void;
  profile: { name?: string; email?: string; phone?: string };
}) {
  const [skillDraft, setSkillDraft] = useState("");
  const set = (patch: Partial<ResumeContent>) => onContent({ ...content, ...patch });
  type ListKey = "experiences" | "educations" | "activities" | "certifications" | "links";
  const list = <K extends ListKey>(k: K) => (content[k] ?? []) as NonNullable<ResumeContent[K]>;
  const add = (k: ListKey) => set({ [k]: [...list(k), { ...EMPTY[k] }] } as Partial<ResumeContent>);
  const remove = (k: ListKey, i: number) => set({ [k]: list(k).filter((_, j) => j !== i) } as Partial<ResumeContent>);
  const update = <K extends ListKey>(k: K, i: number, patch: Record<string, unknown>) =>
    set({ [k]: list(k).map((row, j) => (j === i ? { ...row, ...patch } : row)) } as Partial<ResumeContent>);
  const addSkill = () => {
    const s = skillDraft.trim();
    if (s && !(content.skills ?? []).includes(s)) set({ skills: [...(content.skills ?? []), s] });
    setSkillDraft("");
  };

  return (
    <div className="space-y-4">
      <Card title="이력서 이름" desc="나만 보는 이름입니다. 지원처·용도별로 여러 개를 만들 수 있어요.">
        <input value={title} onChange={e => onTitle(e.target.value)} placeholder="예) 마케터 지원용 · 2026 하반기" className={input} />
      </Card>

      <Card title="기본 정보" desc="프로필에서 불러옵니다. 이력서에 따로 저장하지 않으며, 바꾸려면 프로필에서 수정하세요.">
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          {[["이름", profile.name], ["이메일", profile.email], ["연락처", profile.phone]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-neutral-50 px-4 py-3"><p className="text-xs text-neutral-400">{k}</p><p className="text-neutral-800 mt-0.5 truncate">{v || "—"}</p></div>
          ))}
        </div>
        <Link href="/hero/my" className="text-[13px] text-neutral-500 underline hover:text-neutral-800">프로필 수정</Link>
      </Card>

      <Card title="한 줄 소개 · 희망 직무">
        <div><span className={label}>한 줄 소개</span><input value={content.headline ?? ""} onChange={e => set({ headline: e.target.value })} placeholder="예) 데이터로 소비자를 읽는 퍼포먼스 마케터 지망생" className={input} /></div>
        <div><span className={label}>희망 직무</span><input value={content.desired_job ?? ""} onChange={e => set({ desired_job: e.target.value })} placeholder="예) 퍼포먼스 마케팅 · 광고 기획" className={input} /></div>
      </Card>

      <Card title="경력" desc="회사·직무·기간과 함께, 맡은 일과 성과를 숫자로 적으면 좋습니다. 인턴·아르바이트도 포함하세요." onAdd={() => add("experiences")} addLabel="경력 추가">
        {list("experiences").map((x, i) => (
          <RowBox key={i} onRemove={() => remove("experiences", i)}>
            <div><span className={label}>회사</span><input value={x.company} onChange={e => update("experiences", i, { company: e.target.value })} className={input} /></div>
            <div><span className={label}>직무 · 직책</span><input value={x.role} onChange={e => update("experiences", i, { role: e.target.value })} className={input} /></div>
            <Period start={x.start} end={x.end} current={x.current} onStart={v => update("experiences", i, { start: v })} onEnd={v => update("experiences", i, { end: v })} onCurrent={v => update("experiences", i, { current: v, end: v ? "" : x.end })} />
            <div className="sm:col-span-2"><span className={label}>주요 업무 · 성과</span><textarea rows={4} value={x.description} onChange={e => update("experiences", i, { description: e.target.value })} placeholder={"예) 인스타그램 광고 운영 — 월 예산 300만 원\n· 소재 A/B 테스트로 CTR 1.2% → 2.1%"} className={`${input} resize-y`} /></div>
          </RowBox>
        ))}
        {list("experiences").length === 0 && <p className="text-[13px] text-neutral-400">아직 없습니다. 첫 직장을 준비 중이라면 아래 활동·프로젝트를 채워 주세요.</p>}
      </Card>

      <Card title="학력" onAdd={() => add("educations")} addLabel="학력 추가">
        {list("educations").map((x, i) => (
          <RowBox key={i} onRemove={() => remove("educations", i)}>
            <div><span className={label}>학교</span><input value={x.school} onChange={e => update("educations", i, { school: e.target.value })} className={input} /></div>
            <div><span className={label}>전공</span><input value={x.major} onChange={e => update("educations", i, { major: e.target.value })} className={input} /></div>
            <Period start={x.start} end={x.end} onStart={v => update("educations", i, { start: v })} onEnd={v => update("educations", i, { end: v })} />
            <div><span className={label}>상태</span>
              <select value={x.status} onChange={e => update("educations", i, { status: e.target.value })} className={input}>
                {["졸업", "졸업 예정", "재학", "휴학", "수료", "중퇴"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </RowBox>
        ))}
      </Card>

      <Card title="활동 · 프로젝트" desc="동아리·학회·공모전·대외활동·개인 프로젝트. 무엇을 했고 내 역할과 결과가 무엇이었는지 적어 주세요." onAdd={() => add("activities")} addLabel="활동 추가">
        {list("activities").map((x, i) => (
          <RowBox key={i} onRemove={() => remove("activities", i)}>
            <div><span className={label}>활동명</span><input value={x.name} onChange={e => update("activities", i, { name: e.target.value })} placeholder="예) MADLeague 브랜드 리그" className={input} /></div>
            <div><span className={label}>주최 · 소속</span><input value={x.org} onChange={e => update("activities", i, { org: e.target.value })} className={input} /></div>
            <Period start={x.start} end={x.end} onStart={v => update("activities", i, { start: v })} onEnd={v => update("activities", i, { end: v })} />
            <div className="sm:col-span-2"><span className={label}>역할 · 결과</span><textarea rows={3} value={x.description} onChange={e => update("activities", i, { description: e.target.value })} className={`${input} resize-y`} /></div>
          </RowBox>
        ))}
      </Card>

      <Card title="자격 · 어학" onAdd={() => add("certifications")} addLabel="자격 추가">
        {list("certifications").map((x, i) => (
          <RowBox key={i} onRemove={() => remove("certifications", i)}>
            <div><span className={label}>자격 · 시험명</span><input value={x.name} onChange={e => update("certifications", i, { name: e.target.value })} placeholder="예) GAIQ · TOEIC" className={input} /></div>
            <div><span className={label}>발급 기관</span><input value={x.issuer} onChange={e => update("certifications", i, { issuer: e.target.value })} className={input} /></div>
            <div><span className={label}>취득일</span><input type="month" value={x.date} onChange={e => update("certifications", i, { date: e.target.value })} className={input} /></div>
            <div><span className={label}>점수 · 등급</span><input value={x.score} onChange={e => update("certifications", i, { score: e.target.value })} className={input} /></div>
          </RowBox>
        ))}
      </Card>

      <Card title="스킬" desc="다룰 수 있는 도구·기술을 하나씩 넣어 주세요.">
        <div className="flex flex-wrap gap-2">
          {(content.skills ?? []).map(s => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 pl-3 pr-1.5 py-1 text-sm text-neutral-700">
              {s}<button type="button" aria-label={`${s} 삭제`} onClick={() => set({ skills: (content.skills ?? []).filter(x => x !== s) })} className="p-0.5 text-neutral-400 hover:text-neutral-800"><X className="h-3.5 w-3.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={skillDraft} onChange={e => setSkillDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="예) GA4 · Figma · Excel" className={input} />
          <button type="button" onClick={addSkill} className="shrink-0 px-4 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50">추가</button>
        </div>
      </Card>

      <Card title="자기소개" desc="지원 동기·강점·앞으로의 목표. HIT 결과의 강점을 근거로 써 보세요.">
        <textarea rows={8} value={content.summary ?? ""} onChange={e => set({ summary: e.target.value })} className={`${input} resize-y leading-relaxed`} />
      </Card>

      <Card title="포트폴리오 · 링크" onAdd={() => add("links")} addLabel="링크 추가">
        {list("links").map((x, i) => (
          <RowBox key={i} onRemove={() => remove("links", i)}>
            <div><span className={label}>이름</span><input value={x.label} onChange={e => update("links", i, { label: e.target.value })} placeholder="예) 포트폴리오 · 블로그" className={input} /></div>
            <div><span className={label}>주소</span><input type="url" value={x.url} onChange={e => update("links", i, { url: e.target.value })} placeholder="https://" className={input} /></div>
          </RowBox>
        ))}
      </Card>

      {content.text && (
        <Card title="자유 양식 메모" desc="예전에 자유 양식으로 쓴 내용입니다. 위 항목으로 옮긴 뒤 지워도 됩니다.">
          <textarea rows={8} value={content.text} onChange={e => set({ text: e.target.value })} className={`${input} resize-y font-mono`} />
        </Card>
      )}

      <p className="text-xs text-neutral-400 leading-relaxed px-1">사진·나이·가족 관계·출신 지역처럼 직무와 관계없는 정보는 쓰지 않아도 됩니다.</p>
    </div>
  );
}
