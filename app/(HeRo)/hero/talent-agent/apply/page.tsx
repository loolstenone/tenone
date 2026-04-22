"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Megaphone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const FIELDS = [
  "마케팅 · 브랜딩",
  "크리에이터 · 콘텐츠",
  "창업 · 사업개발",
  "개발 · 엔지니어링",
  "디자인 · UX",
  "데이터 · AI",
  "기타",
];

const STAGES = [
  "학생 · 졸업 예정",
  "신입 · 사회 초년",
  "경력 이직 고민",
  "시니어 리더십 전환",
  "인생 2막 준비",
  "경력 공백 · 복귀",
];

export default function TalentAgentApplyPage() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    field: "",
    stage: "",
    intro: "",
    goal: "",
    portfolio_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("이름과 이메일을 입력해 주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/hero/talent-agent/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, member_id: user?.id ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "신청 실패");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "신청 실패");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-7 w-7 text-[#E53935]" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 mb-2">신청이 접수됐습니다</h1>
          <p className="text-sm text-neutral-500 leading-relaxed mb-8">
            HeRo의 발굴 프로세스가 시작됩니다. 입력하신 이메일로 다음 단계를 안내드리겠습니다.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/hero/hit/a"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E53935] text-white text-sm font-bold hover:bg-red-700"
            >
              HIT 검사 시작하기
            </Link>
            <Link
              href="/hero/my"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50"
            >
              마이페이지로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <Link href="/hero/talent-agent" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> 돌아가기
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[11px] font-semibold tracking-widest uppercase text-[#E53935] mb-4">
          <Megaphone className="h-3.5 w-3.5" />
          Talent Agent
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-3">탤런트 에이전시 신청</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          간단한 정보만 알려주시면 HeRo가 당신을 이해하기 시작합니다. 신청 이후 HIT 검사 · AI 상담 · 전문가 매칭으로 이어집니다.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* 이름 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
            이름 <span className="text-[#E53935]">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={update("name")}
            required
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#E53935]"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
            이메일 <span className="text-[#E53935]">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#E53935]"
          />
        </div>

        {/* 전화 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">전화번호 <span className="text-neutral-400 font-normal">(선택)</span></label>
          <input
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="010-0000-0000"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#E53935]"
          />
        </div>

        {/* 분야 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">희망 분야</label>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setForm((p) => ({ ...p, field: f }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.field === f
                    ? "border-[#E53935] bg-red-50 text-[#E53935] font-semibold"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 단계 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">현재 단계</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((p) => ({ ...p, stage: s }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.stage === s
                    ? "border-[#E53935] bg-red-50 text-[#E53935] font-semibold"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 자기 소개 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">간단한 자기 소개 <span className="text-neutral-400 font-normal">(선택)</span></label>
          <textarea
            value={form.intro}
            onChange={update("intro")}
            rows={3}
            placeholder="지금 어디에서 무엇을 하고 있는지 알려 주세요"
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#E53935] resize-none leading-relaxed"
          />
        </div>

        {/* 원하는 방향 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">원하는 다음 걸음 <span className="text-neutral-400 font-normal">(선택)</span></label>
          <textarea
            value={form.goal}
            onChange={update("goal")}
            rows={3}
            placeholder="어떤 자리 · 어떤 방향 · 어떤 고민이 있는지 편하게 적어 주세요"
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#E53935] resize-none leading-relaxed"
          />
        </div>

        {/* 포트폴리오 URL */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">포트폴리오 링크 <span className="text-neutral-400 font-normal">(선택)</span></label>
          <input
            type="url"
            value={form.portfolio_url}
            onChange={update("portfolio_url")}
            placeholder="https://..."
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#E53935]"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-[#E53935] text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "접수 중…" : "신청하기"}
          </button>
          <p className="text-[11px] text-neutral-400 mt-3 text-center">
            제출하시면 개인정보 수집 · 이용에 동의하시는 것으로 간주합니다. 제공된 정보는 HeRo 매칭 목적으로만 사용됩니다.
          </p>
          {!isAuthenticated && (
            <p className="text-[11px] text-neutral-400 mt-1 text-center">
              회원가입 후 신청하시면 검사 결과가 자동으로 연결됩니다.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
