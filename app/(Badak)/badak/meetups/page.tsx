"use client";

import { useState } from "react";
import { MapPin, Calendar, Users, Clock, ChevronRight } from "lucide-react";

/* ── 타입 ── */
type MeetupCategory = "전체" | "네트워킹" | "멘토링" | "스터디" | "밋업";
type MeetupRegion = "전체" | "서울" | "부산" | "대구" | "광주" | "제주" | "온라인";
type MeetupStatus = "모집중" | "마감임박" | "마감";

interface Meetup {
  id: string;
  title: string;
  category: Exclude<MeetupCategory, "전체">;
  region: Exclude<MeetupRegion, "전체">;
  location: string;
  date: string;
  capacity: number;
  remaining: number;
  price: string;
  host: { name: string; title?: string };
  status: MeetupStatus;
}

/* ── Mock 데이터 ── */
const MEETUPS: Meetup[] = [
  {
    id: "m1",
    title: "DAM Party Season 4",
    category: "네트워킹",
    region: "서울",
    location: "서울 홍대",
    date: "2026.04.18 (토) 19:00",
    capacity: 50,
    remaining: 40,
    price: "무료",
    host: { name: "전천일" },
    status: "모집중",
  },
  {
    id: "m2",
    title: "마케팅 디렉터 멘토링",
    category: "멘토링",
    region: "서울",
    location: "서울 강남",
    date: "2026.04.25 (금) 19:30",
    capacity: 8,
    remaining: 3,
    price: "5만원",
    host: { name: "김민수", title: "HSAD 디렉터" },
    status: "마감임박",
  },
  {
    id: "m3",
    title: "광고인 북클럽 3기",
    category: "스터디",
    region: "서울",
    location: "서울 성수",
    date: "매주 목 19:00",
    capacity: 12,
    remaining: 5,
    price: "3만원/월",
    host: { name: "이수진", title: "제일기획" },
    status: "모집중",
  },
  {
    id: "m4",
    title: "퍼포먼스 마케팅 스터디",
    category: "스터디",
    region: "온라인",
    location: "온라인",
    date: "매주 화 20:00",
    capacity: 15,
    remaining: 7,
    price: "무료",
    host: { name: "퍼포먼스랩" },
    status: "모집중",
  },
  {
    id: "m5",
    title: "부산 업계 밋업",
    category: "밋업",
    region: "부산",
    location: "부산 서면",
    date: "2026.05.10 (토) 14:00",
    capacity: 30,
    remaining: 20,
    price: "무료",
    host: { name: "부산마케터스" },
    status: "모집중",
  },
  {
    id: "m6",
    title: "브랜딩 워크숍",
    category: "멘토링",
    region: "서울",
    location: "서울 을지로",
    date: "2026.04.12 (토) 13:00",
    capacity: 20,
    remaining: 0,
    price: "8만원",
    host: { name: "박지영", title: "브랜드매니저" },
    status: "마감",
  },
];

const CATEGORIES: MeetupCategory[] = ["전체", "네트워킹", "멘토링", "스터디", "밋업"];
const REGIONS: MeetupRegion[] = ["전체", "서울", "부산", "대구", "광주", "제주", "온라인"];

/* ── 상태 뱃지 ── */
function StatusBadge({ status }: { status: MeetupStatus }) {
  if (status === "모집중")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        모집중
      </span>
    );
  if (status === "마감임박")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        마감임박
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-500/20 px-2.5 py-0.5 text-xs font-semibold text-neutral-400">
      마감
    </span>
  );
}

/* ── 정원 바 ── */
function CapacityBar({ capacity, remaining }: { capacity: number; remaining: number }) {
  const filled = capacity - remaining;
  const pct = Math.round((filled / capacity) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-neutral-400">
        <span>{filled}/{capacity}명</span>
        <span>{remaining > 0 ? `${remaining}석 남음` : "마감"}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-neutral-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function MeetupsPage() {
  const [category, setCategory] = useState<MeetupCategory>("전체");
  const [region, setRegion] = useState<MeetupRegion>("전체");

  const filtered = MEETUPS.filter((m) => {
    if (category !== "전체" && m.category !== category) return false;
    if (region !== "전체" && m.region !== region) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Hero */}
      <section className="px-4 pt-20 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">바닥 모임</h1>
        <p className="mt-3 text-neutral-400 text-sm sm:text-base">
          업계 사람들과 직접 만나는 자리
        </p>
      </section>

      {/* Filters */}
      <div className="mx-auto max-w-5xl px-4 space-y-4 mb-8">
        {/* 카테고리 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-2">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === c
                    ? "bg-amber-500 text-white"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {/* 지역 */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-2">지역</label>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  region === r
                    ? "bg-amber-500 text-white"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meetup Cards */}
      <div className="mx-auto max-w-5xl px-4 pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg">해당 조건의 모임이 없습니다</p>
            <p className="text-sm mt-1">다른 카테고리나 지역을 선택해보세요</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3 hover:border-amber-500/40 transition-colors"
              >
                {/* 상태 + 카테고리 */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={m.status} />
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {m.category}
                  </span>
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-bold leading-snug">{m.title}</h3>

                {/* 메타 */}
                <div className="space-y-1.5 text-sm text-neutral-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-amber-500" />
                    <span>{m.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0 text-amber-500" />
                    <span>{m.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="shrink-0 text-amber-500" />
                    <span>호스트: {m.host.name}{m.host.title ? ` (${m.host.title})` : ""}</span>
                  </div>
                </div>

                {/* 정원 바 */}
                <CapacityBar capacity={m.capacity} remaining={m.remaining} />

                {/* 하단: 가격 + 버튼 */}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className={`text-sm font-bold ${m.price === "무료" ? "text-emerald-400" : "text-amber-400"}`}>
                    {m.price}
                  </span>
                  <button
                    disabled={m.status === "마감"}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      m.status === "마감"
                        ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                  >
                    {m.status === "마감" ? "마감됨" : "신청하기"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="border-t border-white/10 py-16 text-center px-4">
        <h2 className="text-xl font-bold mb-2">모임을 열고 싶으신가요?</h2>
        <p className="text-neutral-400 text-sm mb-6">
          바닥 모임 호스트가 되어 업계 사람들과 의미있는 자리를 만들어보세요
        </p>
        <button className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 transition-colors">
          호스트 신청하기 <ChevronRight size={16} />
        </button>
      </section>
    </div>
  );
}
