'use client';

import { useState } from 'react';
import {
  Settings, Shield, Mail, Database, Globe, Lock, Clock, Key,
  Plus, Trash2, Edit2, Check, X, Save, Upload, Eye, EyeOff,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type ConfigTab = 'basic' | 'security' | 'email' | 'codes';

type EmailTemplate = {
  id: string; name: string; subject: string; type: string; lastModified: string; active: boolean;
};

type MasterCode = {
  id: string; category: string; code: string; name: string; sortOrder: number; active: boolean;
};

type IPEntry = { ip: string; label: string };

/* ── Mock Data ── */
const MOCK_BASIC = {
  companyName: 'Ten:One Universe',
  domain: 'tenone.biz',
  logo: '/logo-tenone.svg',
  language: 'ko',
  timezone: 'Asia/Seoul',
  fiscalYearStart: '01',
};

const MOCK_SECURITY = {
  minPasswordLength: 8,
  passwordChangeDays: 90,
  sessionTimeout: 30,
  mfaRequired: false,
  ipWhitelist: [
    { ip: '10.0.0.0/8', label: '내부 네트워크' },
    { ip: '192.168.1.0/24', label: '사무실' },
    { ip: '203.0.113.50', label: 'VPN 게이트웨이' },
  ] as IPEntry[],
  failedLoginLimit: 5,
  lockoutDuration: 15,
};

const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: 'et1', name: '환영 메일', subject: 'Ten:One에 오신 것을 환영합니다!', type: '가입', lastModified: '2026-03-15', active: true },
  { id: 'et2', name: '비밀번호 초기화', subject: '비밀번호 초기화 안내', type: '보안', lastModified: '2026-03-10', active: true },
  { id: 'et3', name: '결재 요청 알림', subject: '[결재] 새 결재 요청이 있습니다', type: '알림', lastModified: '2026-03-20', active: true },
  { id: 'et4', name: '프로젝트 초대', subject: '프로젝트에 초대되었습니다', type: '초대', lastModified: '2026-02-28', active: true },
  { id: 'et5', name: '월간 리포트', subject: '[리포트] 월간 활동 요약', type: '리포트', lastModified: '2026-03-01', active: false },
];

const MOCK_SMTP = {
  host: 'smtp.tenone.biz',
  port: 587,
  encryption: 'TLS',
  username: 'noreply@tenone.biz',
  fromName: 'Ten:One',
  fromEmail: 'noreply@tenone.biz',
};

const MOCK_CODES: MasterCode[] = [
  { id: 'c1', category: '부서코드', code: 'MGT', name: '경영전략', sortOrder: 1, active: true },
  { id: 'c2', category: '부서코드', code: 'DEV', name: '개발', sortOrder: 2, active: true },
  { id: 'c3', category: '부서코드', code: 'MKT', name: '마케팅', sortOrder: 3, active: true },
  { id: 'c4', category: '부서코드', code: 'SAL', name: '영업', sortOrder: 4, active: true },
  { id: 'c5', category: '부서코드', code: 'CST', name: 'CS', sortOrder: 5, active: true },
  { id: 'c6', category: '직급코드', code: 'C-L', name: 'C-Level', sortOrder: 1, active: true },
  { id: 'c7', category: '직급코드', code: 'DIR', name: '이사', sortOrder: 2, active: true },
  { id: 'c8', category: '직급코드', code: 'MGR', name: '매니저', sortOrder: 3, active: true },
  { id: 'c9', category: '직급코드', code: 'SNR', name: '시니어', sortOrder: 4, active: true },
  { id: 'c10', category: '직급코드', code: 'JNR', name: '주니어', sortOrder: 5, active: true },
  { id: 'c11', category: '계정과목', code: '1100', name: '현금및현금성자산', sortOrder: 1, active: true },
  { id: 'c12', category: '계정과목', code: '1200', name: '매출채권', sortOrder: 2, active: true },
  { id: 'c13', category: '계정과목', code: '4100', name: '급여', sortOrder: 3, active: true },
  { id: 'c14', category: '계정과목', code: '4200', name: '복리후생비', sortOrder: 4, active: true },
  { id: 'c15', category: '계정과목', code: '5100', name: '광고선전비', sortOrder: 5, active: true },
];

const TAB_CONFIG: { key: ConfigTab; label: string; icon: typeof Settings }[] = [
  { key: 'basic', label: '기본', icon: Globe },
  { key: 'security', label: '보안', icon: Shield },
  { key: 'email', label: '이메일', icon: Mail },
  { key: 'codes', label: '코드관리', icon: Database },
];

const LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

const TIMEZONES = ['Asia/Seoul', 'Asia/Tokyo', 'America/New_York', 'Europe/London', 'UTC'];
const FISCAL_MONTHS = ['01', '04', '07', '10'];

export default function ConfigPage() {
  const { tenant } = useWIO();
  const [tab, setTab] = useState<ConfigTab>('basic');
  const [basic, setBasic] = useState(MOCK_BASIC);
  const [security, setSecurity] = useState(MOCK_SECURITY);
  const [smtp] = useState(MOCK_SMTP);
  const [templates] = useState(MOCK_TEMPLATES);
  const [codes] = useState(MOCK_CODES);
  const [codeCategory, setCodeCategory] = useState('부서코드');
  const [showPassword, setShowPassword] = useState(false);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const codeCategories = [...new Set(codes.map(c => c.category))];
  const filteredCodes = codes.filter(c => c.category === codeCategory);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold">시스템 설정</h1>
          <span className="text-xs text-slate-500">SYS-CFG</span>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Save size={15} /> 저장
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. 변경사항은 저장되지 않습니다.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/5 pb-px">
        {TAB_CONFIG.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${tab === t.key
                ? 'text-white bg-white/[0.04] border-b-2 border-indigo-500'
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Basic Tab */}
      {tab === 'basic' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-5 max-w-2xl">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">회사명</label>
            <input value={basic.companyName} onChange={e => setBasic({ ...basic, companyName: e.target.value })}
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">도메인</label>
            <input value={basic.domain} onChange={e => setBasic({ ...basic, domain: e.target.value })}
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">로고</label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg border border-white/5 bg-white/[0.03] flex items-center justify-center text-xs text-slate-500">LOGO</div>
              <button className="flex items-center gap-1.5 rounded-lg border border-white/5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:border-white/10">
                <Upload size={13} /> 업로드
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">기본 언어</label>
              <select value={basic.language} onChange={e => setBasic({ ...basic, language: e.target.value })}
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
                {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#0F0F23]">{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">타임존</label>
              <select value={basic.timezone} onChange={e => setBasic({ ...basic, timezone: e.target.value })}
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
                {TIMEZONES.map(tz => <option key={tz} value={tz} className="bg-[#0F0F23]">{tz}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">회계연도 시작월</label>
              <select value={basic.fiscalYearStart} onChange={e => setBasic({ ...basic, fiscalYearStart: e.target.value })}
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
                {FISCAL_MONTHS.map(m => <option key={m} value={m} className="bg-[#0F0F23]">{m}월</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="space-y-5 max-w-2xl">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-5">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Lock size={14} className="text-amber-400" /> 비밀번호 정책</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">최소 자릿수</label>
                <input type="number" value={security.minPasswordLength}
                  onChange={e => setSecurity({ ...security, minPasswordLength: +e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">변경 주기 (일)</label>
                <input type="number" value={security.passwordChangeDays}
                  onChange={e => setSecurity({ ...security, passwordChangeDays: +e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">로그인 실패 제한</label>
                <input type="number" value={security.failedLoginLimit}
                  onChange={e => setSecurity({ ...security, failedLoginLimit: +e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">잠금 시간 (분)</label>
                <input type="number" value={security.lockoutDuration}
                  onChange={e => setSecurity({ ...security, lockoutDuration: +e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Clock size={14} className="text-blue-400" /> 세션 설정</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">세션 타임아웃 (분)</label>
                <input type="number" value={security.sessionTimeout}
                  onChange={e => setSecurity({ ...security, sessionTimeout: +e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <button
                  onClick={() => setSecurity({ ...security, mfaRequired: !security.mfaRequired })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${security.mfaRequired ? 'bg-indigo-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${security.mfaRequired ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-slate-400">MFA 필수</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Shield size={14} className="text-emerald-400" /> IP 화이트리스트</h3>
              <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={12} /> 추가</button>
            </div>
            <div className="space-y-2">
              {security.ipWhitelist.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-sm font-mono flex-1">{entry.ip}</span>
                  <span className="text-xs text-slate-500">{entry.label}</span>
                  <button className="p-1 text-slate-600 hover:text-rose-400"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {tab === 'email' && (
        <div className="space-y-5">
          {/* SMTP Config */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4 max-w-2xl">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Mail size={14} className="text-blue-400" /> SMTP 설정</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">SMTP 서버</label>
                <input defaultValue={smtp.host} className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">포트</label>
                  <input type="number" defaultValue={smtp.port} className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">암호화</label>
                  <select defaultValue={smtp.encryption} className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
                    {['TLS', 'SSL', 'None'].map(e => <option key={e} value={e} className="bg-[#0F0F23]">{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">사용자명</label>
                <input defaultValue={smtp.username} className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">비밀번호</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} defaultValue="••••••••"
                    className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none pr-9" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">발신자 이름</label>
                <input defaultValue={smtp.fromName} className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">발신자 이메일</label>
                <input defaultValue={smtp.fromEmail} className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold">이메일 템플릿</h3>
              <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={12} /> 템플릿 추가</button>
            </div>
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">템플릿명</div>
              <div className="col-span-4">제목</div>
              <div className="col-span-1">유형</div>
              <div className="col-span-2">수정일</div>
              <div className="col-span-1">상태</div>
              <div className="col-span-1">액션</div>
            </div>
            {templates.map(t => (
              <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="col-span-3 text-sm flex items-center">{t.name}</div>
                <div className="col-span-4 text-xs text-slate-400 flex items-center truncate">{t.subject}</div>
                <div className="col-span-1 flex items-center">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{t.type}</span>
                </div>
                <div className="col-span-2 text-xs text-slate-500 flex items-center">{t.lastModified}</div>
                <div className="col-span-1 flex items-center">
                  <span className={`text-[10px] ${t.active ? 'text-emerald-400' : 'text-slate-600'}`}>{t.active ? '활성' : '비활성'}</span>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <button className="p-1 text-slate-500 hover:text-white"><Edit2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Codes Tab */}
      {tab === 'codes' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {codeCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCodeCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${codeCategory === cat
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="ml-auto flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={12} /> 코드 추가</button>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
              <div className="col-span-2">코드</div>
              <div className="col-span-4">이름</div>
              <div className="col-span-2">카테고리</div>
              <div className="col-span-2">정렬순서</div>
              <div className="col-span-1">상태</div>
              <div className="col-span-1">액션</div>
            </div>
            {filteredCodes.map(c => (
              <div key={c.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="col-span-2 text-sm font-mono flex items-center">{c.code}</div>
                <div className="col-span-4 text-sm flex items-center">{c.name}</div>
                <div className="col-span-2 text-xs text-slate-500 flex items-center">{c.category}</div>
                <div className="col-span-2 text-xs text-slate-500 flex items-center">{c.sortOrder}</div>
                <div className="col-span-1 flex items-center">
                  <span className={`text-[10px] ${c.active ? 'text-emerald-400' : 'text-slate-600'}`}>{c.active ? '활성' : '비활성'}</span>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <button className="p-1 text-slate-500 hover:text-white"><Edit2 size={12} /></button>
                  <button className="p-1 text-slate-600 hover:text-rose-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-600">총 {filteredCodes.length}개 코드</div>
        </div>
      )}
    </div>
  );
}
