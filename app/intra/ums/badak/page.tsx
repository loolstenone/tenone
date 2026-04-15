"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink, Users, MessageCircle, Calendar, UserPlus,
  Loader2, Hash, MapPin, TrendingUp, BarChart2,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 ── */
interface MemberRow {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  avatar_initials: string;
  created_at: string;
  affiliations: string[];
}

interface GrowthMetrics {
  totalMembers: number;
  thisMonthNew: number;
  lastMonthNew: number;
  growthRate: number | null; // %
}

interface AnalyticsMetrics {
  mauCount: number | null;
  avgDurationSec: number | null;
  avgWeeklyVisits: number | null;
}

interface ChatRoom {
  name: string;
  category: string;
  members: number;
  isActive: boolean;
}

/* ── Mock: 오픈채팅방 (DB 연동 전까지) ── */
const chatRooms: ChatRoom[] = [
  { name: "바닥 메인", category: "메인", members: 487, isActive: true },
  { name: "서울 모임", category: "지역", members: 234, isActive: true },
  { name: "부산 모임", category: "지역", members: 156, isActive: true },
  { name: "대구 모임", category: "지역", members: 89, isActive: true },
  { name: "네트워킹 라운지", category: "네트워킹", members: 312, isActive: true },
  { name: "취업/이직 정보", category: "커리어", members: 278, isActive: true },
  { name: "사이드 프로젝트", category: "프로젝트", members: 145, isActive: true },
  { name: "스터디 모집", category: "스터디", members: 198, isActive: true },
  { name: "프리랜서 라운지", category: "커리어", members: 167, isActive: true },
  { name: "창업 네트워킹", category: "네트워킹", members: 203, isActive: true },
];

const roomCategories = [
  { name: "메인", count: 3, color: "bg-amber-100 text-amber-700" },
  { name: "지역", count: 12, color: "bg-blue-100 text-blue-700" },
  { name: "네트워킹", count: 8, color: "bg-violet-100 text-violet-700" },
  { name: "커리어", count: 7, color: "bg-emerald-100 text-emerald-700" },
  { name: "스터디", count: 5, color: "bg-rose-100 text-rose-700" },
  { name: "프로젝트", count: 4, color: "bg-cyan-100 text-cyan-700" },
  { name: "기타", count: 3, color: "bg-neutral-100 text-neutral-600" },
];

/* ── Mock: DAM Party ── */
const nextDAMParty = {
  title: "제48회 DAM Party",
  date: "2026-05-17",
  location: "서울 강남 코엑스 컨퍼런스룸",
  expectedAttendees: 120,
  status: "모집중",
};

export default function BadakPage() {
  const [loading, setLoading] = useState(true);
  const [recentMembers, setRecentMembers] = useState<MemberRow[]>([]);
  const [growth, setGrowth] = useState<GrowthMetrics>({
    totalMembers: 0,
    thisMonthNew: 0,
    lastMonthNew: 0,
    growthRate: null,
  });
  const [analytics, setAnalytics] = useState<AnalyticsMetrics>({
    mauCount: null,
    avgDurationSec: null,
    avgWeeklyVisits: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = monthStart;

      // 총 회원 수
      const { count: total } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .contains("affiliations", ["badak"]);

      // 이번달 신규
      const { count: thisMonth } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .contains("affiliations", ["badak"])
        .gte("created_at", monthStart);

      // 지난달 신규
      const { count: lastMonth } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .contains("affiliations", ["badak"])
        .gte("created_at", lastMonthStart)
        .lt("created_at", lastMonthEnd);

      // 성장률: (이번달 - 지난달) / (전체 - 이번달) * 100
      const base = (total ?? 0) - (thisMonth ?? 0);
      const growthRate = base > 0 && lastMonth != null && lastMonth > 0
        ? +((((thisMonth ?? 0) - lastMonth) / lastMonth) * 100).toFixed(1)
        : null;

      setGrowth({
        totalMembers: total ?? 0,
        thisMonthNew: thisMonth ?? 0,
        lastMonthNew: lastMonth ?? 0,
        growthRate,
      });

      // 최근 가입자 5명
      const { data: recent } = await supabase
        .from("members")
        .select("id, name, email, avatar_url, avatar_initials, created_at, affiliations")
        .contains("affiliations", ["badak"])
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentMembers((recent as MemberRow[]) ?? []);

      // Analytics 지표 (수집 데이터가 있을 때만)
      const analyticsRes = await fetch("/api/analytics/event?brand=badak");
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics({
          mauCount: data.sampleSize?.pageViews > 0 ? data.mauCount : null,
          avgDurationSec: data.avgDurationSec,
          avgWeeklyVisits: data.avgWeeklyVisits,
        });
      }
    } catch (err) {
      console.error("Badak data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalRoomMembers = chatRooms.reduce((s, r) => s + r.members, 0);
  const totalRooms = roomCategories.reduce((s, c) => s + c.count, 0);

  const mauRatio = analytics.mauCount != null && growth.totalMembers > 0
    ? +((analytics.mauCount / growth.totalMembers) * 100).toFixed(1)
    : null;

  const avgDurationMin = analytics.avgDurationSec != null
    ? Math.round(analytics.avgDurationSec / 60)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Badak 관리" description="바닥 네트워크 커뮤니티 운영 관리">
        <Link
          href="/badak"
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
          label="총 회원"
          value={growth.totalMembers.toLocaleString() + "명"}
          sub="affiliations: badak"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="오픈채팅방"
          value={totalRooms + "개"}
          sub={`참여자 ${totalRoomMembers.toLocaleString()}명`}
          icon={<MessageCircle className="h-4 w-4" />}
        />
        <StatCard
          label="이번달 신규"
          value={growth.thisMonthNew + "명"}
          sub={growth.lastMonthNew > 0 ? `지난달 ${growth.lastMonthNew}명` : "첫 달"}
          icon={<UserPlus className="h-4 w-4" />}
        />
        <StatCard
          label="다음 DAM Party"
          value={nextDAMParty.date.slice(5).replace("-", "/")}
          sub={nextDAMParty.status}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 오픈채팅방 현황 */}
        <Card>
          <SectionTitle title="오픈채팅방 카테고리" />
          <div className="flex flex-wrap gap-2 mb-5">
            {roomCategories.map((cat) => (
              <span
                key={cat.name}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-sm ${cat.color}`}
              >
                <Hash className="h-3 w-3" />
                {cat.name} {cat.count}
              </span>
            ))}
          </div>

          <SectionTitle title="주요 채팅방 TOP 10" />
          <div className="space-y-2">
            {chatRooms.map((room) => (
              <div
                key={room.name}
                className="flex items-center justify-between py-2 px-3 border border-neutral-100 rounded-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-sm text-neutral-700">{room.name}</span>
                  <span className="text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">
                    {room.category}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">{room.members}명</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 우측 패널 */}
        <div className="space-y-6">
          {/* DAM Party */}
          <Card>
            <SectionTitle title="다음 DAM Party" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-800">{nextDAMParty.title}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-700 rounded-sm">
                  {nextDAMParty.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  {nextDAMParty.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  {nextDAMParty.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-neutral-400" />
                  예상 참석자 {nextDAMParty.expectedAttendees}명
                </div>
              </div>
            </div>
          </Card>

          {/* 최근 가입자 */}
          <Card>
            <SectionTitle title="최근 가입자" action="전체 보기" actionHref="/intra/ums/members/list" />
            {recentMembers.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">Badak 소속 회원 데이터가 없습니다</p>
            ) : (
              <div className="space-y-2.5">
                {recentMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-1.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {m.avatar_initials || m.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-800 truncate">{m.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{m.email}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {new Date(m.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 성장 지표 */}
          <Card>
            <SectionTitle title="성장 지표" />
            <div className="grid grid-cols-2 gap-3">
              {/* 월간 성장률 — 실데이터 */}
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                {growth.growthRate != null ? (
                  <>
                    <p className={`text-lg font-semibold ${growth.growthRate >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {growth.growthRate >= 0 ? "+" : ""}{growth.growthRate}%
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">월간 성장률</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-neutral-800">-</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">월간 성장률</p>
                  </>
                )}
              </div>

              {/* MAU 비율 — analytics 이벤트 기반 */}
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                {mauRatio != null ? (
                  <>
                    <p className="text-lg font-semibold text-neutral-800">{mauRatio}%</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">MAU 비율</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-neutral-300 mt-1">수집 중</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">MAU 비율</p>
                  </>
                )}
              </div>

              {/* 평균 체류시간 — analytics 이벤트 기반 */}
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                {avgDurationMin != null ? (
                  <>
                    <p className="text-lg font-semibold text-neutral-800">{avgDurationMin}분</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">평균 체류시간</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-neutral-300 mt-1">수집 중</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">평균 체류시간</p>
                  </>
                )}
              </div>

              {/* 주간 방문 횟수 — analytics 이벤트 기반 */}
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                {analytics.avgWeeklyVisits != null ? (
                  <>
                    <p className="text-lg font-semibold text-neutral-800">{analytics.avgWeeklyVisits}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">주간 방문 횟수</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-neutral-300 mt-1">수집 중</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">주간 방문 횟수</p>
                  </>
                )}
              </div>
            </div>

            {/* 데이터 출처 안내 */}
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-300">
              <BarChart2 className="h-3 w-3" />
              월간 성장률: DB 실측 · MAU/체류시간/방문: 이벤트 수집 중 (Badak 방문 시 자동 기록)
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
