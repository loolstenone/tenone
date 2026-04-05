"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink, Users, MapPin, Trophy, Activity,
  Loader2, Calendar, Flame, GraduationCap,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

/* ── Mock: 지역 동아리 ── */
const regions = [
  { city: "서울", clubs: 24, members: 890, active: true, color: "bg-violet-500" },
  { city: "부산", clubs: 12, members: 420, active: true, color: "bg-indigo-500" },
  { city: "대구", clubs: 8, members: 280, active: true, color: "bg-blue-500" },
  { city: "광주", clubs: 6, members: 195, active: true, color: "bg-teal-500" },
  { city: "제주", clubs: 4, members: 130, active: true, color: "bg-cyan-500" },
];

/* ── Mock: 현재 시즌 프로젝트 ── */
const seasonProjects = [
  {
    name: "MAD Season 12 - 브랜드 챌린지",
    status: "진행중",
    teams: 18,
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    progress: 45,
  },
  {
    name: "대학모레 2026 Spring",
    status: "모집중",
    teams: 0,
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    progress: 0,
  },
  {
    name: "MAD Hackathon #8",
    status: "준비중",
    teams: 0,
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    progress: 0,
  },
];

/* ── Mock: 최근 활동 로그 ── */
const activityLogs = [
  { text: "서울 15기 '인사이트' 동아리 가입 신청 12건", time: "2시간 전", type: "join" },
  { text: "MAD Season 12 중간 발표 일정 확정", time: "5시간 전", type: "event" },
  { text: "부산 7기 신규 동아리 '브릿지' 승인", time: "1일 전", type: "club" },
  { text: "대구 리전 월간 리포트 제출", time: "1일 전", type: "report" },
  { text: "광주 리전 리더 교체 (김서연 → 박지호)", time: "2일 전", type: "admin" },
  { text: "제주 3기 '파도' 동아리 활동 종료", time: "3일 전", type: "club" },
  { text: "MAD Season 11 우수팀 시상 완료 (5팀)", time: "5일 전", type: "event" },
  { text: "서울 14기 졸업식 사진 업로드", time: "1주 전", type: "content" },
];

const logTypeColor: Record<string, string> = {
  join: "bg-emerald-400",
  event: "bg-violet-400",
  club: "bg-blue-400",
  report: "bg-amber-400",
  admin: "bg-rose-400",
  content: "bg-cyan-400",
};

export default function MADLeaguePage() {
  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();

      // 활동 회원 수 (affiliations에 madleague 포함)
      const { count } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .contains("affiliations", ["madleague"]);
      setTotalMembers(count ?? 0);
    } catch (err) {
      console.error("MADLeague data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalClubs = regions.reduce((s, r) => s + r.clubs, 0);
  const totalRegionMembers = regions.reduce((s, r) => s + r.members, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="MAD League 관리" description="대학 동아리 연합 운영 관리">
        <Link
          href="/madleague"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          사이트 바로가기
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="전체 동아리"
          value={totalClubs + "개"}
          sub={`${regions.length}개 지역`}
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          label="활동 회원"
          value={(totalMembers || totalRegionMembers).toLocaleString() + "명"}
          sub="DB 기준"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="진행중 프로젝트"
          value={seasonProjects.filter((p) => p.status === "진행중").length + "개"}
          sub="이번 시즌"
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatCard
          label="이번주 활동"
          value={activityLogs.filter((l) => !l.time.includes("주")).length + "건"}
          sub="최근 7일"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 지역별 동아리 현황 */}
        <Card>
          <SectionTitle title="지역별 현황" />
          <div className="space-y-3">
            {regions.map((r) => (
              <div key={r.city} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-16">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700">{r.city}</span>
                </div>
                <div className="flex-1 h-6 bg-neutral-50 rounded-sm overflow-hidden relative">
                  <div
                    className={`h-full ${r.color} opacity-80 rounded-sm transition-all`}
                    style={{ width: `${(r.members / 900) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-neutral-700">
                    {r.clubs}개 동아리 / {r.members}명
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 시즌 프로젝트 */}
          <div className="mt-6">
            <SectionTitle title="현재 시즌 프로젝트" />
            <div className="space-y-3">
              {seasonProjects.map((p) => (
                <div key={p.name} className="border border-neutral-100 rounded-sm p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-800">{p.name}</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${
                        p.status === "진행중"
                          ? "bg-emerald-50 text-emerald-700"
                          : p.status === "모집중"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {p.startDate.slice(5)} ~ {p.endDate.slice(5)}
                    </span>
                    {p.teams > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {p.teams}팀
                      </span>
                    )}
                  </div>
                  {p.progress > 0 && (
                    <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 최근 활동 로그 */}
        <Card>
          <SectionTitle title="최근 활동" />
          <div className="space-y-0">
            {activityLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3 border-b border-neutral-50 last:border-0"
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${logTypeColor[log.type] || "bg-neutral-300"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-700 leading-relaxed">{log.text}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 성장 지표 */}
          <div className="mt-6">
            <SectionTitle title="핵심 지표" />
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">12</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">현재 시즌</p>
              </div>
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">54</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">누적 동아리</p>
              </div>
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">1,247</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">누적 졸업생</p>
              </div>
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">89%</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">활동 유지율</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
