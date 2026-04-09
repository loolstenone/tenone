"use client";

import { useState, useEffect } from "react";
import { Users, AlertCircle, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

interface TalentRow {
  id: string;
  type_code: string;
  type_name_ko: string;
  type_nickname: string;
  disc_primary: string;
  mbti_type: string;
  member_id: string | null;
  created_at: string;
  // B results (joined)
  holland_code: string | null;
  readiness_grade: string | null;
  competency_track: string | null;
  alert_level: number;
  alert_n1: number;
  alert_m1: number;
  alert_p1: number;
}

const DISC_COLORS: Record<string, string> = {
  D: '#E53935', I: '#FFB300', S: '#43A047', C: '#1E88E5',
};

export default function TalentDashboardPage() {
  const [talents, setTalents] = useState<TalentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<TalentRow | null>(null);

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const sb = createClient();
      // HIT A 결과 + B 결과 (있으면) 조인
      sb.from('hit_a_results')
        .select('id, type_code, type_name_ko, type_nickname, disc_primary, mbti_type, member_id, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
        .then(async ({ data: aResults }: { data: Record<string, unknown>[] | null }) => {
          if (!aResults) { setLoading(false); return; }

          // B 결과 가져오기
          const rows: TalentRow[] = [];
          for (const a of aResults) {
            const { data: bResult } = await sb.from('hit_b_results')
              .select('holland_code, readiness_grade, competency_track, alert_level, alert_n1, alert_m1, alert_p1')
              .eq('member_id', a.member_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            rows.push({
              ...(a as Omit<TalentRow, 'holland_code' | 'readiness_grade' | 'competency_track' | 'alert_level' | 'alert_n1' | 'alert_m1' | 'alert_p1'>),
              holland_code: (bResult?.holland_code as string) || null,
              readiness_grade: (bResult?.readiness_grade as string) || null,
              competency_track: (bResult?.competency_track as string) || null,
              alert_level: (bResult?.alert_level as number) || 0,
              alert_n1: (bResult?.alert_n1 as number) || 0,
              alert_m1: (bResult?.alert_m1 as number) || 0,
              alert_p1: (bResult?.alert_p1 as number) || 0,
            });
          }
          setTalents(rows);
          setLoading(false);
        });
    });
  }, []);

  const filtered = talents.filter(t =>
    !search || t.type_code.toLowerCase().includes(search.toLowerCase())
    || t.type_name_ko?.includes(search)
    || t.mbti_type?.toLowerCase().includes(search.toLowerCase())
  );

  const alertDot = (level: number) => {
    if (level === 0) return null;
    return (
      <span className="text-red-500 font-bold text-xs tracking-tight">
        {'●'.repeat(Math.min(level, 3))}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">HIT 인재 관리</h1>
          <p className="text-sm text-neutral-400 mt-0.5">검사 완료 인재 목록 · 주의 신호 모니터링</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="유형, MBTI 검색..."
              className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-48 focus:outline-none focus:border-neutral-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-500">유형</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">캐릭터</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">적성</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">역량</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">준비도</th>
                <th className="px-4 py-3 font-semibold text-neutral-500 text-center">신호</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded text-white text-[10px] font-bold flex items-center justify-center"
                        style={{ backgroundColor: DISC_COLORS[t.disc_primary] || '#666' }}
                      >
                        {t.disc_primary}
                      </span>
                      <span className="font-medium">{t.type_code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{t.type_nickname || t.type_name_ko}</td>
                  <td className="px-4 py-3 text-neutral-500">{t.holland_code || '—'}</td>
                  <td className="px-4 py-3 text-neutral-500">{t.competency_track || '—'}</td>
                  <td className="px-4 py-3">
                    {t.readiness_grade ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        t.readiness_grade === 'A' ? 'bg-green-50 text-green-600' :
                        t.readiness_grade === 'B' ? 'bg-yellow-50 text-yellow-600' :
                        t.readiness_grade === 'C' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {t.readiness_grade}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.alert_level > 0 ? (
                      <button
                        onClick={() => setSelectedAlert(selectedAlert?.id === t.id ? null : t)}
                        className="hover:opacity-70 transition-opacity"
                        title="상세 보기"
                      >
                        {alertDot(t.alert_level)}
                      </button>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {t.created_at?.substring(0, 10)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                    검사 완료된 인재가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Alert 상세 팝업 (관리자만) */}
      {selectedAlert && selectedAlert.alert_level > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelectedAlert(null)}>
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">{selectedAlert.type_code} · 신호 상세</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 font-mono">N1</span>
                <span className="text-sm font-bold">{selectedAlert.alert_n1}</span>
                <span>{selectedAlert.alert_n1 >= 70 ? '●' : '○'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 font-mono">M1</span>
                <span className="text-sm font-bold">{selectedAlert.alert_m1}</span>
                <span>{selectedAlert.alert_m1 >= 70 ? '●' : '○'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 font-mono">P1</span>
                <span className="text-sm font-bold">{selectedAlert.alert_p1}</span>
                <span>{selectedAlert.alert_p1 >= 70 ? '●' : '○'}</span>
              </div>
            </div>
            <button onClick={() => setSelectedAlert(null)} className="mt-6 w-full py-2 text-sm bg-neutral-100 rounded-lg hover:bg-neutral-200">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
