'use client';

import { useState } from 'react';
import { FileText, Eye, Plus, Search, Tag, Settings, Check, Link2 } from 'lucide-react';
import { useWIO } from '../../layout';

type Template = {
  id: string; name: string; category: string; description: string;
  fields: string[]; linkedValues: string[]; usageCount: number; updatedAt: string;
};

const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1', name: '기안서', category: '결재', description: '일반 기안을 위한 표준 양식',
    fields: ['제목', '기안 사유', '세부 내용', '첨부파일', '예산(선택)'], linkedValues: ['투명성', '책임감'], usageCount: 156, updatedAt: '2026-03-15',
  },
  {
    id: 't2', name: '주간업무보고서', category: '보고', description: '주간 업무 성과 및 계획 보고',
    fields: ['이번 주 성과', '다음 주 계획', '이슈/리스크', 'KPI 달성률'], linkedValues: ['투명성'], usageCount: 340, updatedAt: '2026-03-20',
  },
  {
    id: 't3', name: '프로젝트 제안서', category: '기획', description: '신규 프로젝트 제안을 위한 양식',
    fields: ['프로젝트명', '배경 및 목적', '범위', '일정', '예산', '기대효과', '리스크'], linkedValues: ['혁신', '협업'], usageCount: 45, updatedAt: '2026-02-28',
  },
  {
    id: 't4', name: '회의록', category: '기록', description: '회의 내용 기록 및 공유 양식',
    fields: ['회의명', '일시', '참석자', '안건', '논의 내용', '결정사항', '액션 아이템'], linkedValues: ['투명성', '협업'], usageCount: 280, updatedAt: '2026-03-25',
  },
  {
    id: 't5', name: '구매요청서', category: '결재', description: '물품/서비스 구매 요청 양식',
    fields: ['품목', '수량', '단가', '총액', '구매 사유', '납품일', '공급업체'], linkedValues: ['책임감'], usageCount: 89, updatedAt: '2026-03-10',
  },
  {
    id: 't6', name: '출장보고서', category: '보고', description: '출장 결과 보고 양식',
    fields: ['출장지', '출장 기간', '목적', '주요 활동', '성과', '비용 내역'], linkedValues: ['투명성', '성장'], usageCount: 34, updatedAt: '2026-01-15',
  },
  {
    id: 't7', name: '교육 수료 보고', category: '교육', description: '교육/세미나 참석 후 보고 양식',
    fields: ['교육명', '교육 기간', '교육 기관', '주요 학습 내용', '업무 적용 계획'], linkedValues: ['성장'], usageCount: 22, updatedAt: '2026-02-10',
  },
  {
    id: 't8', name: '신규 입사자 체크리스트', category: '인사', description: '온보딩 과정 진행 체크리스트',
    fields: ['입사자 정보', '장비 지급', '계정 생성', '멘토 배정', '교육 일정', '1개월 목표'], linkedValues: ['협업', '성장'], usageCount: 15, updatedAt: '2026-03-01',
  },
];

const CATEGORIES = ['전체', '결재', '보고', '기획', '기록', '교육', '인사'];

export default function TemplatePage() {
  const { tenant } = useWIO();
  const [templates] = useState(MOCK_TEMPLATES);
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const filtered = templates
    .filter(t => category === '전체' || t.category === category)
    .filter(t => !searchQuery || t.name.includes(searchQuery));

  const detail = templates.find(t => t.id === selected);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">양식관리</h1>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 새 양식
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="양식 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${category === c ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 양식 목록 */}
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} grid grid-cols-1 ${selected ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-3`}>
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <FileText size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-400">양식이 없습니다</p>
            </div>
          ) : filtered.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id === selected ? null : t.id)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${selected === t.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{t.category}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{t.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-600">
                <span>사용 {t.usageCount}회</span>
                <span>수정 {t.updatedAt.slice(5)}</span>
                {t.linkedValues.length > 0 && (
                  <span className="flex items-center gap-0.5"><Link2 size={9} /> {t.linkedValues.join(', ')}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 미리보기 */}
        {selected && detail && (
          <div className="lg:col-span-1 rounded-xl border border-white/5 bg-white/[0.02] p-4 sticky top-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5"><Eye size={14} className="text-indigo-400" /> 양식 미리보기</h3>

            <div className="space-y-3 mb-4">
              {detail.fields.map((field, i) => (
                <div key={i}>
                  <label className="block text-[10px] text-slate-500 mb-1">{field}</label>
                  <div className="w-full h-8 rounded-lg border border-white/5 bg-white/[0.03]" />
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3">
              <h4 className="text-[10px] text-slate-500 mb-2">핵심가치 연결</h4>
              <div className="flex flex-wrap gap-1.5">
                {detail.linkedValues.map(v => (
                  <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center gap-0.5">
                    <Tag size={8} /> {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-3 space-y-1 text-[10px] text-slate-500">
              <div>카테고리: {detail.category}</div>
              <div>사용 횟수: {detail.usageCount}회</div>
              <div>마지막 수정: {detail.updatedAt}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
