"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink, Users, Trophy, Loader2, GraduationCap, CheckCircle2, XCircle, Eye, EyeOff, Star,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Club { id: string; slug: string; name: string; region: string; color: string | null; }
interface Application {
  id: string; name: string; email: string; phone: string | null; university: string; major: string | null;
  year_in_school: number | null; motivation: string | null; portfolio_url: string | null;
  status: string; created_at: string; year: number;
  mad_clubs?: { slug: string; name: string; region: string; color: string | null } | null;
}
interface HeroApp {
  id: string; name: string; email: string; phone: string | null; interests: string[] | null;
  resume_url: string | null; portfolio_url: string | null; message: string | null;
  status: string; created_at: string;
}
interface Article {
  id: string; slug: string; title: string; category: string;
  is_published: boolean; is_featured: boolean; published_at: string;
  author_name: string | null; club_id: string | null;
}

type Tab = 'overview' | 'applications' | 'hero' | 'articles';

export default function MADLeagueIntraPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Data
  const [clubs, setClubs] = useState<Club[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [heroApps, setHeroApps] = useState<HeroApp[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({ totalClubs: 0, pendingApps: 0, pendingHero: 0, publishedArticles: 0, totalCrowns: 0 });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      if (session?.access_token) setToken(session.access_token);
      else setAuthError(true);
    });
  }, []);

  const loadOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const sb = createClient();
      const [clubRes, crownRes, pubRes] = await Promise.all([
        sb.from('mad_clubs').select('id, slug, name, region, color').eq('status', 'active').order('sort_order'),
        sb.from('mad_competition_results').select('*', { count: 'exact', head: true }).eq('is_crown', true),
        sb.from('mad_articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
      ]);
      const [appsRes, heroRes] = await Promise.all([
        fetch('/api/madleague/admin/applications?status=pending', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/madleague/admin/hero?status=pending', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      setClubs((clubRes.data ?? []) as Club[]);
      setStats({
        totalClubs: (clubRes.data ?? []).length,
        pendingApps: appsRes.applications?.length ?? 0,
        pendingHero: heroRes.applications?.length ?? 0,
        publishedArticles: pubRes.count ?? 0,
        totalCrowns: crownRes.count ?? 0,
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadApps = useCallback(async (status = 'pending') => {
    if (!token) return;
    setLoading(true);
    const res = await fetch(`/api/madleague/admin/applications?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setApps(data.applications ?? []);
    setLoading(false);
  }, [token]);

  const loadHero = useCallback(async (status = 'pending') => {
    if (!token) return;
    setLoading(true);
    const res = await fetch(`/api/madleague/admin/hero?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setHeroApps(data.applications ?? []);
    setLoading(false);
  }, [token]);

  const loadArticles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch('/api/madleague/admin/articles', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setArticles(data.articles ?? []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (tab === 'overview') loadOverview();
    else if (tab === 'applications') loadApps();
    else if (tab === 'hero') loadHero();
    else if (tab === 'articles') loadArticles();
  }, [tab, token, loadOverview, loadApps, loadHero, loadArticles]);

  async function actApp(id: string, action: 'accept' | 'reject' | 'reviewing') {
    if (!token) return;
    setProcessing(id);
    await fetch('/api/madleague/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, action }),
    });
    setApps(prev => prev.filter(a => a.id !== id));
    setProcessing(null);
  }

  async function actHero(id: string, status: string) {
    if (!token) return;
    setProcessing(id);
    await fetch('/api/madleague/admin/hero', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    setHeroApps(prev => prev.filter(a => a.id !== id));
    setProcessing(null);
  }

  async function toggleArticle(id: string, field: 'is_published' | 'is_featured', value: boolean) {
    if (!token) return;
    setProcessing(id);
    await fetch('/api/madleague/admin/articles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, [field]: value }),
    });
    setArticles(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    setProcessing(null);
  }

  if (authError) {
    return (
      <div className="text-center py-20 text-neutral-500">
        <p>세션이 만료되었습니다. 다시 로그인해주세요.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="MAD League 관리" description="대학 동아리 연합 운영 대시보드">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="공식 동아리" value={`${stats.totalClubs}개`} sub="전국 7개 권역" icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard label="대기 지원서" value={`${stats.pendingApps}건`} sub="승인 필요" icon={<Users className="h-4 w-4" />} />
        <StatCard label="HeRo 신청" value={`${stats.pendingHero}건`} sub="대기 중" icon={<Star className="h-4 w-4" />} />
        <StatCard label="발행 아티클" value={`${stats.publishedArticles}개`} sub="MADzine" icon={<Eye className="h-4 w-4" />} />
        <StatCard label="MAD Crown" value={`${stats.totalCrowns}개`} sub="누적" icon={<Trophy className="h-4 w-4" />} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 mb-6">
        {([
          ['overview', '개요'],
          ['applications', `지원서 (${stats.pendingApps})`],
          ['hero', `HeRo (${stats.pendingHero})`],
          ['articles', 'MADzine'],
        ] as Array<[Tab, string]>).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === k ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      )}

      {/* Overview */}
      {tab === 'overview' && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <SectionTitle title="동아리 현황" />
            <div className="space-y-2">
              {clubs.map((c) => (
                <div key={c.slug} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: c.color ?? '#EC1D25' }} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-800">{c.name}</div>
                    <div className="text-xs text-neutral-500">{c.region}</div>
                  </div>
                  <Link href={`/madleague/clubs/${c.slug}`} target="_blank" className="text-xs text-neutral-400 hover:text-neutral-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title="빠른 작업" />
            <div className="space-y-2">
              <button onClick={() => setTab('applications')} className="w-full text-left px-4 py-3 border border-neutral-200 hover:border-neutral-900 transition">
                <div className="text-sm font-medium">지원서 승인 대기 {stats.pendingApps}건</div>
                <div className="text-xs text-neutral-500 mt-0.5">새 매드리거 지원서를 검토하고 승인·반려</div>
              </button>
              <button onClick={() => setTab('hero')} className="w-full text-left px-4 py-3 border border-neutral-200 hover:border-neutral-900 transition">
                <div className="text-sm font-medium">HeRo 상담 신청 {stats.pendingHero}건</div>
                <div className="text-xs text-neutral-500 mt-0.5">커리어 상담 신청자 연락 관리</div>
              </button>
              <button onClick={() => setTab('articles')} className="w-full text-left px-4 py-3 border border-neutral-200 hover:border-neutral-900 transition">
                <div className="text-sm font-medium">MADzine 아티클 관리</div>
                <div className="text-xs text-neutral-500 mt-0.5">발행 상태와 추천 설정</div>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Applications */}
      {tab === 'applications' && !loading && (
        <Card>
          <SectionTitle title="지원서 승인 큐" />
          {apps.length === 0 ? (
            <div className="text-center py-10 text-sm text-neutral-400">대기 중인 지원서가 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {apps.map((a) => (
                <div key={a.id} className="border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {a.mad_clubs && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 border" style={{ borderColor: a.mad_clubs.color ?? '#EC1D25', color: a.mad_clubs.color ?? '#EC1D25' }}>
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.mad_clubs.color ?? '#EC1D25' }} />
                            {a.mad_clubs.name}
                          </span>
                        )}
                        <span className="text-xs text-neutral-400">{new Date(a.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="text-base font-semibold text-neutral-900">{a.name}</div>
                      <div className="text-sm text-neutral-600 mt-0.5">
                        {a.university}{a.major && ` · ${a.major}`}{a.year_in_school && ` · ${a.year_in_school}학년`}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {a.email}{a.phone && ` · ${a.phone}`}
                      </div>
                      {a.motivation && (
                        <div className="mt-3 text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-3">{a.motivation}</div>
                      )}
                      {a.portfolio_url && (
                        <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          포트폴리오 <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        disabled={processing === a.id}
                        onClick={() => actApp(a.id, 'accept')}
                        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> 승인
                      </button>
                      <button
                        disabled={processing === a.id}
                        onClick={() => actApp(a.id, 'reject')}
                        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 border border-neutral-300 hover:border-red-500 hover:text-red-600 text-neutral-600 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" /> 반려
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* HeRo */}
      {tab === 'hero' && !loading && (
        <Card>
          <SectionTitle title="HeRo 상담 신청" />
          {heroApps.length === 0 ? (
            <div className="text-center py-10 text-sm text-neutral-400">대기 중인 신청이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {heroApps.map((h) => (
                <div key={h.id} className="border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-base font-semibold text-neutral-900">{h.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {h.email}{h.phone && ` · ${h.phone}`} · {new Date(h.created_at).toLocaleDateString('ko-KR')}
                      </div>
                      {h.interests && h.interests.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {h.interests.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200">{tag}</span>
                          ))}
                        </div>
                      )}
                      {h.message && (
                        <div className="mt-3 text-sm text-neutral-700 bg-neutral-50 p-3">{h.message}</div>
                      )}
                      <div className="mt-2 flex gap-3">
                        {h.resume_url && <a href={h.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">이력서 ↗</a>}
                        {h.portfolio_url && <a href={h.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">포트폴리오 ↗</a>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        disabled={processing === h.id}
                        onClick={() => actHero(h.id, 'contacted')}
                        className="text-xs font-medium px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-300 text-white transition"
                      >
                        연락함
                      </button>
                      <button
                        disabled={processing === h.id}
                        onClick={() => actHero(h.id, 'matched')}
                        className="text-xs font-medium px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white transition"
                      >
                        매칭 완료
                      </button>
                      <button
                        disabled={processing === h.id}
                        onClick={() => actHero(h.id, 'closed')}
                        className="text-xs font-medium px-3 py-2 border border-neutral-300 hover:border-red-500 hover:text-red-600 text-neutral-600 transition"
                      >
                        종료
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Articles */}
      {tab === 'articles' && !loading && (
        <Card>
          <SectionTitle title="MADzine 아티클" />
          {articles.length === 0 ? (
            <div className="text-center py-10 text-sm text-neutral-400">아티클이 없습니다.</div>
          ) : (
            <div className="space-y-1">
              {articles.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 ${
                    a.category === 'interview' ? 'bg-violet-50 text-violet-700' :
                    a.category === 'case'      ? 'bg-blue-50 text-blue-700' :
                    a.category === 'report'    ? 'bg-amber-50 text-amber-700' :
                    a.category === 'cover'     ? 'bg-rose-50 text-rose-700' :
                                                  'bg-neutral-100 text-neutral-700'
                  }`}>{a.category}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-800 truncate">{a.title}</div>
                    <div className="text-xs text-neutral-400">{a.author_name ?? '편집부'} · {new Date(a.published_at).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <button
                    disabled={processing === a.id}
                    onClick={() => toggleArticle(a.id, 'is_featured', !a.is_featured)}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 border transition ${a.is_featured ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-neutral-200 text-neutral-400 hover:border-amber-500'}`}
                    title="추천"
                  >
                    <Star className="h-3 w-3" fill={a.is_featured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    disabled={processing === a.id}
                    onClick={() => toggleArticle(a.id, 'is_published', !a.is_published)}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 border transition ${a.is_published ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-neutral-200 text-neutral-400 hover:border-neutral-900'}`}
                  >
                    {a.is_published ? <><Eye className="h-3 w-3" /> 발행</> : <><EyeOff className="h-3 w-3" /> 비공개</>}
                  </button>
                  <Link href={`/madleague/madzine/${a.slug}`} target="_blank" className="text-xs text-neutral-400 hover:text-neutral-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
