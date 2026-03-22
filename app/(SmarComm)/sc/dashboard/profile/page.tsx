'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, LogOut, ExternalLink, UserPlus, Mail, Palette, Upload, X, ImageIcon } from 'lucide-react';
import { getSCUser, scLogout } from '@/lib/smarcomm/auth';
import { useRouter } from 'next/navigation';
import { CHART_PALETTES, getChartPalette, setChartPalette, type ChartPalette } from '@/lib/smarcomm/chart-palette';

type SettingsTab = 'workspace' | 'members' | 'palette' | 'plan' | 'integrations';

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>('workspace');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [industry, setIndustry] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [goal, setGoal] = useState('');
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [saved, setSaved] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState('mono');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getSCUser();

  useEffect(() => {
    const data = localStorage.getItem('sc_company');
    if (data) {
      const parsed = JSON.parse(data);
      setCompanyName(parsed.name || '');
      setCompanyLogo(parsed.logo || '');
      setIndustry(parsed.industry || '');
      setSiteUrl(parsed.siteUrl || '');
      setGoal(parsed.goal || '');
    }
    setSelectedPalette(getChartPalette().id);
  }, []);

  const handleLogoFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { alert('2MB 이하 이미지만 업로드 가능합니다.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCompanyLogo(dataUrl);
      // 즉시 저장
      const existing = localStorage.getItem('sc_company');
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem('sc_company', JSON.stringify({ ...parsed, logo: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  }, [handleLogoFile]);

  const handleRemoveLogo = () => {
    setCompanyLogo('');
    const existing = localStorage.getItem('sc_company');
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem('sc_company', JSON.stringify({ ...parsed, logo: '' }));
  };

  const handleSave = () => {
    localStorage.setItem('sc_company', JSON.stringify({ name: companyName, industry, siteUrl, goal, logo: companyLogo }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { scLogout(); router.push('/'); };

  const inputClass = "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none";

  const TABS = [
    { id: 'workspace' as SettingsTab, label: '워크스페이스' },
    { id: 'members' as SettingsTab, label: '멤버 · 권한' },
    { id: 'palette' as SettingsTab, label: '차트 컬러' },
    { id: 'plan' as SettingsTab, label: '사용중인 플랜' },
    { id: 'integrations' as SettingsTab, label: '외부 연동' },
  ];

  return (
    <div className="max-w-4xl">
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

          {/* 회사 로고 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">회사 로고</h2>
            <div className="flex items-start gap-5">
              {/* 로고 미리보기 */}
              <div className="relative shrink-0">
                {companyLogo ? (
                  <div className="relative">
                    <img src={companyLogo} alt="로고" className="h-20 w-20 rounded-xl border border-border object-cover" />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow-sm hover:bg-danger/80"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface text-text-muted">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>

              {/* 드래그앤드롭 영역 */}
              <div
                className={`flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                <Upload size={20} className={`mb-2 ${dragOver ? 'text-accent' : 'text-text-muted'}`} />
                <p className="text-sm text-text-sub">
                  {dragOver ? '여기에 놓으세요' : '이미지를 드래그하거나 클릭하여 업로드'}
                </p>
                <p className="mt-1 text-xs text-text-muted">PNG, JPG, SVG · 2MB 이하 · 권장 200×200px</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoFile(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* 회사 프로필 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">회사 프로필</h2>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs text-text-sub">회사명</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="주식회사 OOO" className={inputClass} /></div>
              <div><label className="mb-1 block text-xs text-text-sub">업종</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputClass}>
                  <option value="">선택</option><option value="food">음식/F&B</option><option value="beauty">뷰티</option><option value="fashion">패션</option><option value="tech">IT/테크</option><option value="education">교육</option><option value="retail">소매/유통</option><option value="service">서비스</option><option value="medical">의료</option><option value="other">기타</option>
                </select>
              </div>
              <div><label className="mb-1 block text-xs text-text-sub">대표 사이트 URL</label><input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="https://yourcompany.com" className={inputClass} /></div>
              <div><label className="mb-1 block text-xs text-text-sub">마케팅 목표</label>
                <select value={goal} onChange={e => setGoal(e.target.value)} className={inputClass}>
                  <option value="">선택</option><option value="awareness">인지도 향상</option><option value="traffic">트래픽 증가</option><option value="conversion">매출 증대</option><option value="retention">리텐션</option><option value="seo">검색 순위</option><option value="geo">AI 검색 노출</option>
                </select>
              </div>
              <button onClick={handleSave} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-text py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
                <Save size={15} /> {saved ? '저장 완료!' : '저장'}
              </button>
            </div>
          </div>

          {/* 로그아웃은 상단 프로필 드롭다운에서 */}
        </div>
      )}

      {/* 권한 설정 탭은 멤버·권한에 통합 */}

      {/* 플랜 */}
      {tab === 'plan' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 text-center">
            <div className="text-xs text-text-muted mb-1">현재 플랜</div>
            <div className="text-3xl font-bold text-text mb-2">Free</div>
            <p className="text-sm text-text-sub mb-4">무료 플랜으로 기본 기능을 사용 중입니다</p>
            <button className="rounded-xl bg-text px-6 py-2.5 text-sm font-semibold text-white">플랜 업그레이드</button>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">사용량</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: '진단 횟수', used: '22', limit: '무제한' },
                { label: '소재 생성', used: '5', limit: '5건 (무료)' },
                { label: 'CRM 메시지', used: '0', limit: '100건/월' },
                { label: '팀 멤버', used: '1', limit: '3명' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-text-sub">{item.label}</span>
                  <span className="text-text">{item.used} / {item.limit}</span>
                </div>
              ))}
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
                    { role: '일반', plan: '무료', scan: '✓', creative: '🔒', analysis: '🔒', crm: '🔒', settings: '—', color: getChartPalette().colors[3], desc: '사이트 진단만 가능, 유료 전환 유도' },
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
            <p className="mt-3 text-xs text-text-muted">🔒 표시된 기능은 무료 사용자에게 비활성화되며, 유료 전환을 유도하는 안내가 표시됩니다.</p>
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
        <div>
          <p className="mb-4 text-sm text-text-sub">자주 사용하는 업무 툴과 SmarComm을 연동하여 팀원들과 함께 관리해보세요.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Google Analytics', desc: 'GA4와 연동하여 사이트 데이터를 통합 분석', connected: false },
              { name: 'Slack', desc: '진단 완료, 캠페인 변경 등 알림을 슬랙으로 전달', connected: false },
              { name: 'Notion', desc: '보고서와 인사이트를 노션으로 자동 내보내기', connected: false },
              { name: '네이버 검색광고', desc: '네이버 SA 캠페인 데이터 연동', connected: false },
              { name: '카카오 비즈', desc: '카카오톡 채널 및 알림톡 연동', connected: false },
              { name: 'Meta Ads', desc: '메타(FB/IG) 광고 캠페인 연동', connected: false },
            ].map((tool, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-5">
                <h3 className="mb-1 text-sm font-semibold text-text">{tool.name}</h3>
                <p className="mb-3 text-xs text-text-sub">{tool.desc}</p>
                <button className="w-full rounded-xl border border-border py-2 text-xs font-medium text-text-sub hover:bg-surface hover:text-text">
                  연동하기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
