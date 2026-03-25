'use client';

const MODULE_INFO: Record<string, { title: string; desc: string; sprint: string }> = {
  people: { title: '인재', desc: '인재 DB, 역량 진단, 포인트, 매칭', sprint: 'Sprint 3' },
  sales: { title: '영업', desc: 'AI 크롤링, 리드/딜 파이프라인, 캠페인', sprint: 'Sprint 3' },
  learn: { title: '교육', desc: 'LMS, 과정, 퀴즈, 이수 관리', sprint: 'Sprint 4' },
  content: { title: '콘텐츠', desc: 'CMS, AI 생성, 뉴스레터', sprint: 'Sprint 4' },
  wiki: { title: '위키', desc: '지식관리, 아카이브, 문서', sprint: 'Sprint 4' },
  insight: { title: '인사이트', desc: 'BI 대시보드, 경영 분석', sprint: 'Sprint 5' },
  settings: { title: '설정', desc: '테넌트 설정, 멤버 관리, 브랜딩', sprint: 'Sprint 5' },
};

export default function ModulePage() {
  const path = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '';
  const info = MODULE_INFO[path] || { title: path, desc: '', sprint: '' };

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">{info.title}</h1>
      <p className="text-sm text-slate-500 mb-6">{info.desc}</p>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <p className="text-slate-500">{info.sprint}에서 구현 예정</p>
      </div>
    </div>
  );
}
