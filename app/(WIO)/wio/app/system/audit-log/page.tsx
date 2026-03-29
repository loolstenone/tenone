'use client';

import { useState } from 'react';
import { ScrollText, Search, Download, Filter, Calendar } from 'lucide-react';
import { useWIO } from '../../layout';

type AuditEntry = {
  id: string; timestamp: string; user: string; module: string;
  action: string; detail: string; ip: string;
};

const MODULES = ['전체', '사용자', '프로젝트', '재무', '인사', '설정', '보안', '콘텐츠', '결재'];
const ACTIONS = ['생성', '수정', '삭제', '조회', '승인', '반려', '로그인', '로그아웃', '내보내기'];

const MOCK_AUDITS: AuditEntry[] = [
  { id: 'a1', timestamp: '2026-03-29 14:32:15', user: '김대표', module: '결재', action: '승인', detail: '"마케팅 예산 증액 요청" 결재 승인', ip: '211.234.56.78' },
  { id: 'a2', timestamp: '2026-03-29 14:28:03', user: '박개발', module: '프로젝트', action: '수정', detail: 'WIO v2.2 스프린트 태스크 상태 변경 (진행중 → 완료)', ip: '175.123.45.67' },
  { id: 'a3', timestamp: '2026-03-29 14:15:42', user: '이마케팅', module: '콘텐츠', action: '생성', detail: '새 캠페인 "봄맞이 프로모션" 생성', ip: '121.178.90.12' },
  { id: 'a4', timestamp: '2026-03-29 13:45:22', user: '최인사', module: '인사', action: '수정', detail: '신규 입사자 온보딩 일정 변경', ip: '59.12.34.56' },
  { id: 'a5', timestamp: '2026-03-29 13:30:11', user: '한재무', module: '재무', action: '내보내기', detail: '3월 매출 리포트 CSV 내보내기', ip: '210.99.88.77' },
  { id: 'a6', timestamp: '2026-03-29 13:15:00', user: '정디자인', module: '콘텐츠', action: '수정', detail: 'LUKI 브랜드 가이드 v3 업데이트', ip: '175.123.45.67' },
  { id: 'a7', timestamp: '2026-03-29 12:55:30', user: '김대표', module: '설정', action: '수정', detail: '조직 정보 업데이트 (서비스명 변경)', ip: '211.234.56.78' },
  { id: 'a8', timestamp: '2026-03-29 12:30:18', user: '박개발', module: '설정', action: '수정', detail: '모듈 활성화: 경연, 네트워킹', ip: '175.123.45.67' },
  { id: 'a9', timestamp: '2026-03-29 12:00:00', user: '시스템', module: '보안', action: '조회', detail: '자동 보안 스캔 실행', ip: '127.0.0.1' },
  { id: 'a10', timestamp: '2026-03-29 11:30:00', user: '이프론트', module: '프로젝트', action: '생성', detail: '새 태스크 "대시보드 반응형 개선" 생성', ip: '121.178.90.12' },
  { id: 'a11', timestamp: '2026-03-29 11:00:00', user: '윤기획', module: '콘텐츠', action: '생성', detail: 'MAD League 기획서 업로드', ip: '59.12.34.56' },
  { id: 'a12', timestamp: '2026-03-29 10:30:00', user: '최인사', module: '사용자', action: '생성', detail: '신규 사용자 "신입사원" 계정 생성', ip: '59.12.34.56' },
  { id: 'a13', timestamp: '2026-03-29 10:00:00', user: '정백엔드', module: '프로젝트', action: '수정', detail: 'API 엔드포인트 문서 업데이트', ip: '210.99.88.77' },
  { id: 'a14', timestamp: '2026-03-29 09:30:00', user: '한재무', module: '재무', action: '생성', detail: '3월 정산 데이터 등록', ip: '210.99.88.77' },
  { id: 'a15', timestamp: '2026-03-29 09:00:00', user: '김대표', module: '보안', action: '로그인', detail: '관리자 로그인', ip: '211.234.56.78' },
  { id: 'a16', timestamp: '2026-03-28 18:30:00', user: '한재무', module: '보안', action: '로그아웃', detail: '세션 종료', ip: '210.99.88.77' },
  { id: 'a17', timestamp: '2026-03-28 17:45:00', user: '정디자인', module: '보안', action: '로그아웃', detail: '세션 종료', ip: '175.123.45.67' },
  { id: 'a18', timestamp: '2026-03-28 17:00:00', user: '이마케팅', module: '결재', action: '생성', detail: '"마케팅 예산 증액 요청" 결재 상신', ip: '121.178.90.12' },
  { id: 'a19', timestamp: '2026-03-28 16:30:00', user: '박개발', module: '프로젝트', action: '삭제', detail: '중복 태스크 삭제', ip: '175.123.45.67' },
  { id: 'a20', timestamp: '2026-03-28 16:00:00', user: '최인사', module: '인사', action: '수정', detail: 'GPR 평가 기준 업데이트', ip: '59.12.34.56' },
];

export default function AuditLogPage() {
  const { tenant } = useWIO();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('전체');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const filtered = MOCK_AUDITS
    .filter(a => moduleFilter === '전체' || a.module === moduleFilter)
    .filter(a => !userFilter || a.user.includes(userFilter))
    .filter(a => !dateFilter || a.timestamp.startsWith(dateFilter))
    .filter(a => !searchQuery || a.detail.toLowerCase().includes(searchQuery.toLowerCase()) || a.action.includes(searchQuery));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">감사로그</h1>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all">
          <Download size={14} /> 내보내기
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="상세 내용 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:outline-none">
          {MODULES.map(m => <option key={m} value={m} className="bg-[#0F0F23]">{m}</option>)}
        </select>
        <input value={userFilter} onChange={e => setUserFilter(e.target.value)} placeholder="사용자"
          className="w-24 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>

      {/* 로그 테이블 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2">시간</th>
                <th className="text-left px-4 py-2">사용자</th>
                <th className="text-left px-4 py-2">모듈</th>
                <th className="text-left px-4 py-2">액션</th>
                <th className="text-left px-4 py-2">상세</th>
                <th className="text-left px-4 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">검색 결과가 없습니다</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-xs text-slate-500 font-mono whitespace-nowrap">{a.timestamp}</td>
                  <td className="px-4 py-2.5 text-xs">{a.user}</td>
                  <td className="px-4 py-2.5"><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{a.module}</span></td>
                  <td className="px-4 py-2.5"><span className={`text-[10px] font-semibold ${a.action === '삭제' ? 'text-rose-400' : a.action === '생성' ? 'text-emerald-400' : a.action === '수정' ? 'text-blue-400' : 'text-slate-400'}`}>{a.action}</span></td>
                  <td className="px-4 py-2.5 text-xs text-slate-300 max-w-[300px] truncate">{a.detail}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 font-mono">{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-white/5 text-xs text-slate-600">
          총 {filtered.length}건
        </div>
      </div>
    </div>
  );
}
