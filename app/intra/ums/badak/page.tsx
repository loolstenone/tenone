"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink, Users, UserPlus, Loader2,
  MapPin, Calendar, MessageSquare, Cloud,
  TrendingUp, CheckCircle, Clock, AlertCircle,
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
}

interface GroupRow {
  id: string;
  title: string;
  status: string;
  current_members: number;
  max_members: number;
  event_date: string | null;
  location: string | null;
  created_at: string;
}

interface NeedRow {
  id: string;
  display_text: string;
  count: number;
  interest_count: number;
  status: string;
}

interface GroupStats {
  total: number;
  recruiting: number;
  confirmed: number;
  closed: number;
  recentGroups: GroupRow[];
}

interface NeedStats {
  total: number;
  gathering: number;
  groupCreated: number;
  topNeeds: NeedRow[];
}

interface PostStats {
  total: number;
  chat: number;
  review: number;
  proposal: number;
}

interface GrowthMetrics {
  totalMembers: number;
  thisMonthNew: number;
  lastMonthNew: number;
  growthRate: number | null;
}

interface AnalyticsMetrics {
  mauCount: number | null;
  avgDurationSec: number | null;
  avgWeeklyVisits: number | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  recruiting:     { label: "모집중",   color: "bg-emerald-50 text-emerald-700" },
  pending_review: { label: "검토중",   color: "bg-amber-50 text-amber-700" },
  confirmed:      { label: "확정",     color: "bg-indigo-50 text-indigo-700" },
  closed:         { label: "마감",     color: "bg-neutral-100 text-neutral-500" },
};

export default function BadakPage() {
  const [loading, setLoading] = useState(true);
  const [growth, setGrowth] = useState<GrowthMetrics>({ totalMembers: 0, thisMonthNew: 0, lastMonthNew: 0, growthRate: null });
  const [recentMembers, setRecentMembers] = useState<MemberRow[]>([]);
  const [groupStats, setGroupStats] = useState<GroupStats>({ total: 0, recruiting: 0, confirmed: 0, closed: 0, recentGroups: [] });
  const [needStats, setNeedStats] = useState<NeedStats>({ total: 0, gathering: 0, groupCreated: 0, topNeeds: [] });
  const [postStats, setPostStats] = useState<PostStats>({ total: 0, chat: 0, review: 0, proposal: 0 });
  const [analytics, setAnalytics] = useState<AnalyticsMetrics>({ mauCount: null, avgDurationSec: null, avgWeeklyVisits: null });

  useEffect(() => {
    loadData();
    loadAnalytics();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [
        { count: total },
        { count: thisMonth },
        { count: lastMonth },
        { data: recent },
        { data: groups },
        { data: needs },
        { count: postTotal },
        { count: postChat },
        { count: postReview },
        { count: postProposal },
        { count: needTotal },
        { count: needGathering },
        { count: needGroupCreated },
      ] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["badak"]),
        supabase.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["badak"]).gte("created_at", monthStart),
        supabase.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["badak"]).gte("created_at", lastMonthStart).lt("created_at", monthStart),
        supabase.from("members").select("id, name, email, avatar_url, avatar_initials, created_at").contains("affiliations", ["badak"]).order("created_at", { ascending: false }).limit(5),
        supabase.from("badak_groups").select("id, title, status, current_members, max_members, event_date, location, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("badak_needs").select("id, display_text, count, interest_count, status").order("count", { ascending: false }).limit(10),
        supabase.from("badak_community_posts").select("*", { count: "exact", head: true }),
        supabase.from("badak_community_posts").select("*", { count: "exact", head: true }).eq("board", "chat"),
        supabase.from("badak_community_posts").select("*", { count: "exact", head: true }).eq("board", "review"),
        supabase.from("badak_community_posts").select("*", { count: "exact", head: true }).eq("board", "proposal"),
        supabase.from("badak_needs").select("*", { count: "exact", head: true }),
        supabase.from("badak_needs").select("*", { count: "exact", head: true }).eq("status", "gathering"),
        supabase.from("badak_needs").select("*", { count: "exact", head: true }).eq("status", "group_created"),
      ]);

      const growthRate = lastMonth != null && lastMonth > 0
        ? +((((thisMonth ?? 0) - lastMonth) / lastMonth) * 100).toFixed(1)
        : null;
      setGrowth({ totalMembers: total ?? 0, thisMonthNew: thisMonth ?? 0, lastMonthNew: lastMonth ?? 0, growthRate });
      setRecentMembers((recent as MemberRow[]) ?? []);

      const g = (groups ?? []) as GroupRow[];
      setGroupStats({
        total: g.length,
        recruiting: g.filter(x => x.status === "recruiting").length,
        confirmed: g.filter(x => x.status === "confirmed").length,
        closed: g.filter(x => x.status === "closed").length,
        recentGroups: g.slice(0, 6),
      });

      const n = (needs ?? []) as NeedRow[];
      setNeedStats({
        total: needTotal ?? 0,
        gathering: needGathering ?? 0,
        groupCreated: needGroupCreated ?? 0,
        topNeeds: n,
      });

      setPostStats({ total: postTotal ?? 0, chat: postChat ?? 0, review: postReview ?? 0, proposal: postProposal ?? 0 });
    } catch (err) {
      console.error("Badak data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("/api/analytics/event?brand=badak", { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        setAnalytics({
          mauCount: data.sampleSize?.pageViews > 0 ? data.mauCount : null,
          avgDurationSec: data.avgDurationSec,
          avgWeeklyVisits: data.avgWeeklyVisits,
        });
      }
    } catch { /* 수집 중 상태 유지 */ }
  }

  const avgDurationMin = analytics.avgDurationSec != null ? Math.round(analytics.avgDurationSec / 60) : null;
  const mauRatio = analytics.mauCount != null && growth.totalMembers > 0
    ? +((analytics.mauCount / growth.totalMembers) * 100).toFixed(1) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Badak 관리" description="바닥 네트워크 커뮤니티 운영 현황">
        <Link href="/badak" target="_blank"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
          <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
        </Link>
      </PageHeader>

      {/* ── 핵심 지표 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="총 회원" value={growth.totalMembers.toLocaleString() + "명"}
          sub={growth.thisMonthNew > 0 ? `이번달 +${growth.thisMonthNew}명` : "신규 없음"}
          icon={<Users className="h-4 w-4" />} />
        <StatCard label="진행 중인 모임" value={groupStats.recruiting + "개"}
          sub={`전체 ${groupStats.total}개 · 확정 ${groupStats.confirmed}개`}
          icon={<Calendar className="h-4 w-4" />} />
        <StatCard label="니즈 클라우드" value={needStats.total + "개"}
          sub={`모이는 중 ${needStats.gathering}개 · 모임성사 ${needStats.groupCreated}개`}
          icon={<Cloud className="h-4 w-4" />} />
        <StatCard label="커뮤니티 글" value={postStats.total.toLocaleString() + "개"}
          sub={`수다 ${postStats.chat} · 후기 ${postStats.review} · 제안 ${postStats.proposal}`}
          icon={<MessageSquare className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── 모임 현황 ── */}
        <Card>
          <SectionTitle title="모임 현황" action="전체 보기" actionHref="/badak/groups" />

          {/* 상태 요약 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "모집중", value: groupStats.recruiting, icon: <Clock className="h-3.5 w-3.5 text-emerald-500" /> },
              { label: "확정", value: groupStats.confirmed, icon: <CheckCircle className="h-3.5 w-3.5 text-indigo-500" /> },
              { label: "마감", value: groupStats.closed, icon: <AlertCircle className="h-3.5 w-3.5 text-neutral-400" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-3 bg-neutral-50 rounded-sm">
                {icon}
                <span className="text-lg font-semibold text-neutral-800">{value}</span>
                <span className="text-[10px] text-neutral-400">{label}</span>
              </div>
            ))}
          </div>

          {/* 최근 모임 목록 */}
          <SectionTitle title="최근 모임" />
          {groupStats.recentGroups.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">등록된 모임이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {groupStats.recentGroups.map((g) => {
                const st = STATUS_LABEL[g.status] ?? { label: g.status, color: "bg-neutral-100 text-neutral-500" };
                return (
                  <div key={g.id} className="flex items-start justify-between py-2 px-3 border border-neutral-100 rounded-sm">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
                        <p className="text-sm text-neutral-700 truncate">{g.title}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                        {g.location && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{g.location}</span>}
                        {g.event_date && <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{new Date(g.event_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>}
                      </div>
                    </div>
                    <span className="ml-2 shrink-0 text-xs text-neutral-400">{g.current_members}/{g.max_members}명</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── 우측 컬럼 ── */}
        <div className="space-y-6">

          {/* 니즈 클라우드 TOP 10 */}
          <Card>
            <SectionTitle title="니즈 클라우드 TOP 10" action="탐색 페이지" actionHref="/badak/explore" />
            {needStats.topNeeds.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">니즈 데이터가 없습니다</p>
            ) : (
              <div className="space-y-1.5">
                {needStats.topNeeds.map((n, i) => (
                  <div key={n.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded hover:bg-neutral-50">
                    <span className="w-4 text-[10px] font-bold text-neutral-300 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full bg-amber-400"
                          style={{ width: `${Math.min(100, (n.count / (needStats.topNeeds[0]?.count || 1)) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-neutral-700 truncate">{n.display_text}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-semibold text-neutral-600">{n.count}명</span>
                      {n.status === "group_created" && (
                        <div className="text-[9px] text-indigo-500 font-medium">모임성사</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      {m.avatar_initials || m.name?.charAt(0)}
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
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                {growth.growthRate != null ? (
                  <>
                    <p className={`text-lg font-semibold ${growth.growthRate >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {growth.growthRate >= 0 ? "+" : ""}{growth.growthRate}%
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">월간 성장률</p>
                    <p className="text-[9px] text-neutral-300 mt-0.5">지난달 {growth.lastMonthNew}명 기준</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-neutral-800">-</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">월간 성장률</p>
                  </>
                )}
              </div>
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
            <p className="mt-3 text-[9px] text-neutral-300 text-center">
              ※ 성장률: DB 실측 · MAU/체류시간/방문: 이벤트 수집 중 (Badak 방문 시 자동 기록)
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
