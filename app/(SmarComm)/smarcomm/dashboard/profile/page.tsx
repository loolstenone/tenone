'use client';

import { useState, useEffect } from 'react';
import { Save, LogOut, ExternalLink, UserPlus, Mail, Palette } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { CHART_PALETTES, getChartPalette, setChartPalette, type ChartPalette } from '@/lib/smarcomm/chart-palette';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

type SettingsTab = 'workspace' | 'members' | 'palette' | 'plan' | 'integrations';

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>('workspace');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [goal, setGoal] = useState('');
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [saved, setSaved] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState('mono');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const { user, logout } = useAuth();

  useEffect(() => {
    const data = localStorage.getItem('smarcomm_company');
    if (data) {
      const parsed = JSON.parse(data);
      setCompanyName(parsed.name || '');
      setIndustry(parsed.industry || '');
      setSiteUrl(parsed.siteUrl || '');
      setGoal(parsed.goal || '');
    }
    setSelectedPalette(getChartPalette().id);
  }, []);

  const handleSave = () => {
    localStorage.setItem('smarcomm_company', JSON.stringify({ name: companyName, industry, siteUrl, goal, logo: '' }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

  const inputClass = "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none";

  const TABS = [
    { id: 'workspace' as SettingsTab, label: '기업정보' },
    { id: 'members' as SettingsTab, label: '관리자 · 권한' },
    { id: 'palette' as SettingsTab, label: '차트 컬러' },
    { id: 'plan' as SettingsTab, label: '플랜 관리' },
    { id: 'integrations' as SettingsTab, label: '외부 연동' },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <h1 className="mb-1 text-xl font-bold text-text">워크스페이스 설정</h1>
      <p className="mb-6 text-xs text-text-muted">워크스페이스 정보와 연동을 관리합니다</p>

      {/* 탭 */}
      <div className="mb-6 flex border-b border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t.id ? 'border-text text-text' : 'border-transparent text-text-muted hover:text-text-sub'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 워크스페이스 탭 */}
      {tab === 'workspace' && (
        <div className="space-y-6">
          {/* 계정 정보 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">계정 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-sub">이메일</span><span className="text-text">{user?.email}</span></div>
              <div className="flex justify-between"><span className="text-text-sub">가입일</span><span className="text-text">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</span></div>
              <div className="flex justify-between"><span className="text-text-sub">타임존</span>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs">
                  <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 기업 기본 정보 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">기업 기본 정보</h2>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs text-text-sub">회사명 / 브랜드명</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="주식회사 OOO" className={inputClass} /></div>
              <div><label className="mb-1 block text-xs text-text-sub">업종</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputClass}>
                  <option value="">선택</option><option value="ecommerce">이커머스</option><option value="food">음식/F&B</option><option value="beauty">뷰티/화장품</option><option value="fashion">패션/의류</option><option value="tech">IT/테크/SaaS</option><option value="education">교육</option><option value="retail">소매/유통</option><option value="service">전문 서비스</option><option value="medical">의료/헬스케어</option><option value="finance">금융/핀테크</option><option value="travel">여행/관광</option><option value="realestate">부동산</option><option value="other">기타</option>
                </select>
              </div>
              <div><label className="mb-1 block text-xs text-text-sub">대표 사이트 URL</label><input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="https://yourcompany.com" className={inputClass} />
                <p className="mt-1 text-[10px] text-text-muted">GEO & SEO 진단, AI 가시성 테스트에 기본 URL로 사용됩니다</p>
              </div>
              <div><label className="mb-1 block text-xs text-text-sub">마케팅 목표</label>
                <select value={goal} onChange={e => setGoal(e.target.value)} className={inputClass}>
                  <option value="">선택</option><option value="awareness">브랜드 인지도 향상</option><option value="traffic">웹사이트 트래픽 증가</option><option value="conversion">전환율/매출 증대</option><option value="retention">고객 유지/재구매</option><option value="seo">검색 순위 개선</option><option value="geo">AI 검색 노출 강화</option>
                </select>
              </div>
            </div>
          </div>

          {/* 브랜드 & AI 설정 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">브랜드 & AI 설정</h2>
            <p className="mb-4 text-[10px] text-text-muted">AI 소재 생성, 캠페인 기획서에 자동 반영됩니다</p>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs text-text-sub">브랜드 톤앤매너</label>
                <select className={inputClass}>
                  <option value="">선택</option><option value="professional">전문적/신뢰감</option><option value="friendly">친근한/따뜻한</option><option value="trendy">트렌디/감각적</option><option value="luxury">프리미엄/고급</option><option value="casual">캐주얼/재미있는</option><option value="informative">정보 중심/교육적</option>
                </select>
              </div>
              <div><label className="mb-1 block text-xs text-text-sub">타깃 고객</label>
                <input placeholder="예: 20~30대 여성, 서울 거주, 뷰티에 관심" className={inputClass} />
              </div>
              <div><label className="mb-1 block text-xs text-text-sub">핵심 제품/서비스</label>
                <input placeholder="예: AI 마케팅 자동화 플랫폼" className={inputClass} />
              </div>
              <div><label className="mb-1 block text-xs text-text-sub">차별점 (USP)</label>
                <input placeholder="예: 30초 만에 SEO/GEO 진단, AI가 캠페인 자동 기획" className={inputClass} />
              </div>
            </div>
          </div>

          {/* 경쟁사 & 키워드 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">경쟁사 & 키워드</h2>
            <p className="mb-4 text-[10px] text-text-muted">GEO 가시성 비교, SEO 키워드 추적에 사용됩니다</p>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs text-text-sub">경쟁사 URL (최대 5개)</label>
                {[1, 2, 3].map(i => (
                  <input key={i} placeholder={`경쟁사 ${i} URL`} className={`${inputClass} ${i > 1 ? 'mt-2' : ''}`} />
                ))}
                <button className="mt-2 text-xs text-point hover:underline">+ 경쟁사 추가</button>
              </div>
              <div><label className="mb-1 block text-xs text-text-sub">핵심 키워드 (쉼표로 구분)</label>
                <input placeholder="예: AI 마케팅, SEO 진단, GEO 최적화" className={inputClass} />
                <p className="mt-1 text-[10px] text-text-muted">프롬프트 추적, AI 가시성 모니터링에 사용됩니다</p>
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-text py-3 text-sm font-semibold text-white hover:bg-accent-sub">
            <Save size={15} /> {saved ? '저장 완료!' : '기업정보 저장'}
          </button>
        </div>
      )}

      {/* 권한 설정 탭은 멤버·권한에 통합 */}

      {/* 플랜 */}
      {tab === 'plan' && (
        <div className="space-y-6">
          {/* 현재 플랜 */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-text-muted mb-1">현재 플랜</div>
                <div className="text-2xl font-bold text-text">Free</div>
                <p className="mt-1 text-xs text-text-sub">무료 플랜으로 기본 진단 기능을 사용 중입니다</p>
              </div>
              <button className="rounded-xl bg-text px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">업그레이드</button>
            </div>
          </div>

          {/* 이번 달 사용량 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">이번 달 사용량</h2>
            <div className="space-y-4">
              {[
                { label: '사이트 진단', used: 5, limit: 10, unit: '회' },
                { label: 'AI 캠페인 기획서', used: 2, limit: 3, unit: '건' },
                { label: 'AI 소재 생성', used: 8, limit: 15, unit: '개' },
                { label: '팀 멤버', used: 1, limit: 1, unit: '명' },
              ].map((item, i) => {
                const pct = Math.min(100, (item.used / item.limit) * 100);
                return (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-text-sub">{item.label}</span>
                      <span className="font-medium text-text">{item.used} / {item.limit}{item.unit}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface">
                      <div className={`h-2 rounded-full transition-all ${pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-point'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 플랜 비교 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">플랜 비교</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-xs text-text-muted">
                  <th className="px-3 py-2 text-left font-medium">기능</th>
                  <th className="px-3 py-2 text-center font-medium bg-surface">Free</th>
                  <th className="px-3 py-2 text-center font-medium">Standard<br/><span className="text-[10px]">₩99,000/월</span></th>
                  <th className="px-3 py-2 text-center font-medium">Pro<br/><span className="text-[10px]">₩299,000/월</span></th>
                </tr></thead>
                <tbody className="text-xs">
                  {[
                    { feature: '사이트 진단', free: '10회/월', standard: '100회/월', pro: '무제한' },
                    { feature: 'AI 기획서', free: '3건/월', standard: '30건/월', pro: '무제한' },
                    { feature: 'AI 소재 생성', free: '15개/월', standard: '200개/월', pro: '무제한' },
                    { feature: '팀 멤버', free: '1명', standard: '5명', pro: '20명' },
                    { feature: '외부 연동', free: '—', standard: '3개', pro: '무제한' },
                    { feature: 'AI 가시성 추적', free: '—', standard: '주 1회', pro: '일 1회' },
                    { feature: '리포트 자동 발송', free: '—', standard: '—', pro: '✓' },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 text-text-sub">{r.feature}</td>
                      <td className="px-3 py-2.5 text-center bg-surface">{r.free}</td>
                      <td className="px-3 py-2.5 text-center">{r.standard}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-point">{r.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 계정 관리 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">계정 관리</h2>
            <div className="flex gap-3">
              <button className="rounded-xl border border-border px-4 py-2 text-xs text-text-sub hover:bg-surface">다운그레이드</button>
              <button className="rounded-xl border border-danger/30 px-4 py-2 text-xs text-danger hover:bg-danger/5">서비스 탈퇴</button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 · 권한 */}
      {tab === 'members' && (
        <div className="space-y-6">
          {/* 초대 방식 3가지 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">멤버 초대</h2>
            <div className="mb-4 flex gap-2">
              {['이메일 초대', '가입자 추가', '계정 생성'].map((method, i) => (
                <button key={i} onClick={() => setInviteRole(i === 0 ? 'invite' : i === 1 ? 'add' : 'create')}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${inviteRole === (i === 0 ? 'invite' : i === 1 ? 'add' : 'create') ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                  {method}
                </button>
              ))}
            </div>

            {inviteRole === 'invite' && (
              <div>
                <p className="mb-3 text-xs text-text-muted">초대 메일을 보내고, 받은 사람이 가입하면 자동으로 팀에 추가됩니다.</p>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="초대할 이메일 주소"
                      className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
                  </div>
                  <select className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-text focus:outline-none">
                    <option value="crew">운영 크루</option>
                    <option value="viewer">뷰어</option>
                  </select>
                  <button className="rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">초대 메일 발송</button>
                </div>
              </div>
            )}

            {inviteRole === 'add' && (
              <div>
                <p className="mb-3 text-xs text-text-muted">이미 SmarComm에 가입한 사용자를 이메일로 검색하여 팀에 추가합니다.</p>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="가입된 이메일로 검색"
                      className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
                  </div>
                  <select className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-text focus:outline-none">
                    <option value="crew">운영 크루</option>
                    <option value="viewer">뷰어</option>
                  </select>
                  <button className="rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">추가</button>
                </div>
              </div>
            )}

            {inviteRole === 'create' && (
              <div>
                <p className="mb-3 text-xs text-text-muted">관리자가 직접 계정과 임시 비밀번호를 생성합니다. 첫 로그인 시 비밀번호 변경을 요청합니다.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="email" placeholder="이메일" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
                  <input type="text" placeholder="임시 비밀번호" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
                  <select className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-text focus:outline-none">
                    <option value="crew">운영 크루</option>
                    <option value="viewer">뷰어</option>
                  </select>
                  <button className="rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">계정 생성</button>
                </div>
              </div>
            )}
          </div>

          {/* 역할 체계 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">역할 · 권한 체계</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted">
                    <th className="px-4 py-2.5 text-left font-medium">역할</th>
                    <th className="px-4 py-2.5 text-center font-medium">플랜</th>
                    <th className="px-4 py-2.5 text-center font-medium">사이트 진단</th>
                    <th className="px-4 py-2.5 text-center font-medium">소재/캠페인</th>
                    <th className="px-4 py-2.5 text-center font-medium">분석/리포트</th>
                    <th className="px-4 py-2.5 text-center font-medium">CRM</th>
                    <th className="px-4 py-2.5 text-center font-medium">설정</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { role: '관리자', plan: '유료', scan: '✓', creative: '✓', analysis: '✓', crm: '✓', settings: '✓', color: getChartPalette().colors[0], desc: '모든 권한 + 멤버/설정 관리' },
                    { role: '운영 크루', plan: '유료', scan: '✓', creative: '✓', analysis: '✓', crm: '✓', settings: '—', color: getChartPalette().colors[1], desc: '워크스페이스 설정 제외 모든 기능' },
                    { role: '뷰어', plan: '유료', scan: '✓', creative: '보기만', analysis: '보기만', crm: '보기만', settings: '—', color: getChartPalette().colors[2], desc: '리포트 조회만 가능' },
                    { role: '일반', plan: '무료', scan: '✓', creative: '—', analysis: '—', crm: '—', settings: '—', color: getChartPalette().colors[3], desc: '사이트 진단만 가능, 유료 전환 유도' },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                          <div>
                            <div className="font-semibold text-text">{r.role}</div>
                            <div className="text-[10px] text-text-muted">{r.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.plan === '유료' ? 'bg-success/10 text-success' : 'bg-surface text-text-muted'}`}>{r.plan}</span></td>
                      <td className="px-4 py-3 text-center text-sm">{r.scan}</td>
                      <td className="px-4 py-3 text-center text-sm">{r.creative}</td>
                      <td className="px-4 py-3 text-center text-sm">{r.analysis}</td>
                      <td className="px-4 py-3 text-center text-sm">{r.crm}</td>
                      <td className="px-4 py-3 text-center text-sm">{r.settings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-text-muted">"—" 표시된 기능은 무료 사용자에게 비활성화되며, 유료 전환을 유도하는 안내가 표시됩니다.</p>
          </div>

          {/* 현재 멤버 */}
          <div className="rounded-2xl border border-border bg-white">
            <div className="border-b border-border px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">현재 멤버</h2>
              <span className="text-xs text-text-muted">1명 / 3명 (플랜 한도)</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-2.5 text-left font-medium">멤버</th>
                <th className="px-5 py-2.5 text-center font-medium">역할</th>
                <th className="px-5 py-2.5 text-center font-medium">상태</th>
                <th className="px-5 py-2.5 text-right font-medium">참여일</th>
              </tr></thead>
              <tbody>
                <tr className="hover:bg-surface">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-text text-xs font-bold text-white">{user?.email?.charAt(0).toUpperCase()}</div>
                      <div>
                        <span className="text-sm font-medium text-text">{user?.email}</span>
                        <div className="text-[10px] text-text-muted">대표 관리자</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: getChartPalette().colors[0], background: getChartPalette().colors[0] + '10' }}>관리자</span>
                  </td>
                  <td className="px-5 py-3 text-center"><span className="text-xs text-success">● 활성</span></td>
                  <td className="px-5 py-3 text-right text-text-muted">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 차트 컬러 팔레트 */}
      {tab === 'palette' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">차트 컬러 팔레트</h2>
            <p className="mb-4 text-xs text-text-muted">보고서와 대시보드 차트에 적용할 컬러 팔레트를 선택하세요</p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CHART_PALETTES.map(palette => (
                <button
                  key={palette.id}
                  onClick={() => { setSelectedPalette(palette.id); setChartPalette(palette.id); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${selectedPalette === palette.id ? 'border-text bg-surface' : 'border-border hover:border-text/30'}`}
                >
                  <div className="mb-2 text-sm font-semibold text-text">{palette.name}</div>
                  <div className="flex gap-1">
                    {palette.preview.map((color, i) => (
                      <div key={i} className="h-6 flex-1 rounded" style={{ background: color }} />
                    ))}
                  </div>
                  {selectedPalette === palette.id && (
                    <div className="mt-2 text-[10px] font-medium text-success">✓ 적용 중</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 미리보기 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">미리보기</h2>
            <div className="flex items-end gap-2">
              {CHART_PALETTES.find(p => p.id === selectedPalette)?.preview.map((color, i) => (
                <div key={i} className="flex-1">
                  <div className="rounded-t-lg" style={{ background: color, height: `${40 + Math.random() * 60}px` }} />
                  <div className="mt-1 text-center text-[9px] text-text-muted">{['A', 'B', 'C', 'D', 'E'][i]}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-1">
                {CHART_PALETTES.find(p => p.id === selectedPalette)?.preview.map((color, i) => (
                  <div key={i} className="h-4 w-4 rounded-full border-2 border-white" style={{ background: color }} />
                ))}
              </div>
              <span className="text-xs text-text-muted">도넛/파이 차트 미리보기</span>
            </div>
          </div>

          {saved && (
            <div className="rounded-xl bg-success/10 px-4 py-2 text-center text-xs font-medium text-success">
              컬러 팔레트가 적용되었습니다
            </div>
          )}
        </div>
      )}

      {/* 외부 연동 */}
      {tab === 'integrations' && (
        <div className="space-y-6">
          <p className="text-sm text-text-sub">SmarComm과 제휴하고 있는 외부 서비스를 연동하여 데이터를 자동 수집하고 마케팅을 실행합니다.</p>

          {/* 분석 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">분석 · 트래킹</h2>
            <div className="space-y-3">
              {[
                { name: 'Google Analytics (GA4)', desc: '웹사이트 트래픽, 전환, 사용자 행동 데이터', status: 'available' },
                { name: 'Google Search Console', desc: 'SEO 키워드 순위, 클릭, 노출 데이터', status: 'available' },
                { name: '네이버 서치어드바이저', desc: '네이버 검색 노출, 클릭, 키워드 데이터', status: 'planned' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <div>
                      <div className="text-sm font-medium text-text">{s.name}</div>
                      <div className="text-[10px] text-text-muted">{s.desc}</div>
                    </div>
                  </div>
                  <button className={`rounded-lg px-3 py-1.5 text-[10px] font-medium ${s.status === 'planned' ? 'bg-surface text-text-muted cursor-not-allowed' : 'border border-border text-text-sub hover:bg-surface hover:text-text'}`} disabled={s.status === 'planned'}>
                    {s.status === 'planned' ? '준비중' : '연동하기'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 광고 매체 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">광고 매체</h2>
            <div className="space-y-3">
              {[
                { name: 'Google Ads', desc: '검색/디스플레이/영상 광고 캠페인 성과', status: 'available' },
                { name: 'Meta Ads (Facebook/Instagram)', desc: 'Meta 광고 캠페인 성과 및 소재 관리', status: 'available' },
                { name: '네이버 검색광고 (SA)', desc: '네이버 검색광고 캠페인 데이터', status: 'available' },
                { name: '네이버 GFA', desc: '네이버 성과형 디스플레이 광고', status: 'planned' },
                { name: '카카오 모먼트', desc: '카카오톡/다음 광고 캠페인 데이터', status: 'planned' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <div>
                      <div className="text-sm font-medium text-text">{s.name}</div>
                      <div className="text-[10px] text-text-muted">{s.desc}</div>
                    </div>
                  </div>
                  <button className={`rounded-lg px-3 py-1.5 text-[10px] font-medium ${s.status === 'planned' ? 'bg-surface text-text-muted cursor-not-allowed' : 'border border-border text-text-sub hover:bg-surface hover:text-text'}`} disabled={s.status === 'planned'}>
                    {s.status === 'planned' ? '준비중' : '연동하기'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CRM · 메시징 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">CRM · 메시징</h2>
            <div className="space-y-3">
              {[
                { name: '카카오 비즈메시지', desc: '알림톡, 친구톡 발송 (카카오톡 채널 연동)', status: 'planned' },
                { name: '이메일 발송 (AWS SES)', desc: '대량 이메일 캠페인 발송', status: 'planned' },
                { name: 'Firebase (푸시 알림)', desc: '웹/앱 푸시 알림 발송', status: 'planned' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <div>
                      <div className="text-sm font-medium text-text">{s.name}</div>
                      <div className="text-[10px] text-text-muted">{s.desc}</div>
                    </div>
                  </div>
                  <button className="rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-text-muted cursor-not-allowed" disabled>준비중</button>
                </div>
              ))}
            </div>
          </div>

          {/* 협업 · 알림 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">협업 · 알림</h2>
            <div className="space-y-3">
              {[
                { name: 'Slack', desc: '진단 완료, 캠페인 변경, 알림을 슬랙 채널로 전달', status: 'planned' },
                { name: 'Notion', desc: '리포트, 인사이트를 노션 페이지로 자동 내보내기', status: 'planned' },
                { name: 'Google Sheets', desc: '데이터를 구글 스프레드시트로 자동 동기화', status: 'planned' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <div>
                      <div className="text-sm font-medium text-text">{s.name}</div>
                      <div className="text-[10px] text-text-muted">{s.desc}</div>
                    </div>
                  </div>
                  <button className="rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-text-muted cursor-not-allowed" disabled>준비중</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface px-4 py-3 text-center text-xs text-text-muted">
            연동 서비스는 순차적으로 확대됩니다. 필요한 연동이 있으면 <button className="text-point hover:underline">요청하기</button>
          </div>
        </div>
      )}
    </div>
  );
}
