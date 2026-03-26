'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

const METHODS = [
  { code: 'VH', name: 'Vision House', tagline: '조직의 존재 이유와 방향을 설계하는 프레임워크', tag: '전략·비전', color: '#E24B4A',
    desc: 'Philosophy → Mission → Vision → Goal → Strategy → Core Values → Declaration. 위에서 아래로 일관된 체계를 설계한다.',
    products: [
      { name: 'Vision House 워크샵', form: '반일(4시간)', target: '대표/경영진', price: '150만원' },
      { name: 'Vision House 컨설팅', form: '2주 집중', target: '창업팀/리브랜딩', price: '500만원' },
      { name: 'Vision House 템플릿 키트', form: '디지털 다운로드', target: '셀프서비스', price: '15만원' },
      { name: 'Vision House 진단', form: '온라인 설문 + AI 리포트', target: '기존 조직', price: '30만원' },
    ]},
  { code: 'P10', name: 'Principle 10', tagline: '조직의 행동 원칙을 설계하고 내재화하는 프로그램', tag: '문화·원칙', color: '#534AB7',
    desc: '10대 행동 원칙을 고객사에 맞게 설계하고 내재화. "우리는 모두 기획자다" 등 현장에서 검증된 원칙 기반.',
    products: [
      { name: 'Principle 설계 워크샵', form: '1일(8시간)', target: '리더+팀원 합동', price: '200만원' },
      { name: 'Principle 내재화 프로그램', form: '4주', target: '전 조직원', price: '400만원' },
      { name: 'Culture Book 제작', form: '맞춤 핸드북', target: '조직 전체', price: '300만원' },
    ]},
  { code: 'Vr', name: 'Vrief', tagline: '조사분석 → 가설검증 → 전략수립. 기획의 시작을 바꾸는 프레임워크', tag: '기획·실행', color: '#1D9E75',
    desc: '"처음부터 PPT 열지 마세요. Vrief 질문에 답하면 그것 자체가 제안서의 시나리오가 됩니다."',
    products: [
      { name: 'Vrief 실전 워크샵', form: '1일(8시간)', target: '기획팀/마케팅팀', price: '250만원' },
      { name: 'Vrief for Campus', form: '반일(4시간)', target: '대학생', price: '100만원' },
      { name: 'Vrief 코칭', form: '4주 실전 동행', target: '에이전시 PM', price: '600만원' },
      { name: 'Vrief 템플릿 키트', form: '디지털', target: '셀프서비스', price: '10만원' },
      { name: 'Vrief 온라인 강의', form: 'VOD 5강', target: '전체', price: '5만원' },
      { name: 'Vrief for AI', form: 'AI+프롬프트', target: '기획자/마케터', price: '15만원' },
    ]},
  { code: 'GPR', name: 'GPR', tagline: 'Goal → Plan → Result. 목표를 세우고 피드백하고 성장하는 학습 엔진', tag: '성과·성장', color: '#378ADD',
    desc: 'OKR·KPI·MBO를 대체하는 것이 아니라, 그 위에서 작동하는 "성과관리 OS".',
    products: [
      { name: 'GPR 도입 워크샵', form: '1일(8시간)', target: '조직 리더', price: '250만원' },
      { name: 'GPR 운영 코칭', form: '12주', target: '전사 도입 기업', price: '800만원' },
      { name: 'GPR × OKR 통합', form: '반일(4시간)', target: 'OKR 사용 기업', price: '200만원' },
      { name: 'GPR for 개인', form: '온라인 2시간', target: '개인', price: '5만원' },
      { name: 'GPR 가이드북', form: 'PDF 전자책', target: '전체', price: '3만원' },
    ]},
  { code: 'TW', name: 'Ten:One Wheel', tagline: '신뢰 → 참여 → 프로젝트 → 성공 → 기회 → 성장의 선순환', tag: '성장·구조', color: '#BA7517',
    desc: '커뮤니티, 네트워크, 에이전시 조직이 지속 성장하는 플라이휠 구조를 설계한다.',
    products: [
      { name: '플라이휠 설계 워크샵', form: '1일(8시간)', target: '커뮤니티/네트워크', price: '300만원' },
      { name: '플라이휠 컨설팅', form: '4주', target: '에이전시', price: '700만원' },
      { name: '플라이휠 진단', form: '온라인 설문', target: '기존 조직', price: '50만원' },
    ]},
  { code: 'WIO', name: 'WIO Protocol', tagline: '하나로 일하기 위한 운영 규칙. 도구 + 프로세스 + 문화 통합', tag: '운영·통합', color: '#D4537E',
    desc: 'Vision House + Principle 10 + Vrief + GPR + 플라이휠을 하나의 운영 체계로 통합.',
    products: [
      { name: 'WIO 도입 컨설팅', form: '8주', target: 'System 구매 고객', price: '2,000만원' },
      { name: 'WIO 전환 패키지', form: '12주+', target: 'SaaS 탈출 기업', price: '3,000만원' },
      { name: 'WIO 정기 코칭', form: '월 1회', target: '도입 완료 기업', price: '월 100만원' },
    ]},
];

const COMBOS = [
  { name: 'WIO Starter Kit', desc: 'GPR 워크샵 + Vrief 워크샵 + 템플릿 키트', price: '450만원', original: '510만원' },
  { name: 'WIO Culture Pack', desc: 'Vision House + Principle 설계 + Culture Book', price: '800만원', original: '1,000만원' },
  { name: 'WIO Full Transform', desc: 'VH + P10 + Vrief + GPR + 플라이휠 + System Pro 1년', price: '5,000만원', original: '6,800만원' },
  { name: 'WIO for Campus Pack', desc: 'Vrief Campus + GPR 개인 + System Campus 1년', price: '연 2,000만원', original: '' },
];

export default function FrameworkPage() {
  return (
    <>
      <WIOMarketingHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6"><ArrowLeft size={14} /> WIO</Link>
          <h1 className="text-3xl font-bold mb-2">WIO Method</h1>
          <p className="text-slate-400 mb-1">일하는 방식을 팝니다.</p>
          <p className="text-sm text-slate-500 mb-8">6개 방법론 · 25개 상품 · 3만원~5,000만원</p>

          <div className="space-y-6">
            {METHODS.map((m, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden" style={{ borderLeftWidth: 3, borderLeftColor: m.color }}>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold" style={{ background: `${m.color}20`, color: m.color }}>{m.code}</div>
                    <div className="flex-1">
                      <h2 className="font-bold text-white">{m.name}</h2>
                      <p className="text-xs text-slate-500">{m.tagline}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${m.color}15`, color: m.color }}>{m.tag}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{m.desc}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-slate-600 border-b border-white/5">
                        <th className="text-left py-2 font-medium">상품</th>
                        <th className="text-left py-2 font-medium">형태</th>
                        <th className="text-left py-2 font-medium">대상</th>
                        <th className="text-right py-2 font-medium">비용</th>
                      </tr></thead>
                      <tbody>
                        {m.products.map((p, j) => (
                          <tr key={j} className="border-b border-white/5 last:border-0">
                            <td className="py-2 font-medium text-white">{p.name}</td>
                            <td className="py-2 text-slate-500">{p.form}</td>
                            <td className="py-2 text-slate-500">{p.target}</td>
                            <td className="py-2 text-right text-indigo-300 font-medium">{p.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 추천 조합 */}
          <div className="mt-10 rounded-xl border border-white/5 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold text-white mb-4">추천 조합 패키지</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {COMBOS.map((c, i) => (
                <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <h3 className="font-bold text-white mb-1">{c.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{c.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-400">{c.price}</span>
                    {c.original && <span className="text-xs text-slate-600 line-through">{c.original}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-600">
            핵심 차별점: "방법론이 WIO System에 내장되어, 교육받은 그대로 시스템에서 실행"
          </div>
        </div>
      </div>
    </>
  );
}
