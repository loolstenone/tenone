'use client';

import { useState, useEffect } from 'react';
import {
  User, Building2, Calendar, Clock, Briefcase, GraduationCap, Award,
  TrendingUp, Home, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../../layout';

/* ── MY 탭 네비게이션 ── */
const MY_TABS = [
  { label: '대시보드', href: '/wio/app/my' },
  { label: '인사기록', href: '/wio/app/my/hr' },
  { label: '내 평가', href: '/wio/app/my/evaluation' },
  { label: '내 업무', href: '/wio/app/my/work' },
  { label: '기안/결재', href: '/wio/app/my/approval' },
];

/* ── Mock data ── */
const MOCK_PROFILE = {
  name: '김민지',
  department: '마케팅팀',
  position: '대리',
  employeeNo: 'EMP-2024-042',
  joinDate: '2024-03-04',
  tenure: '2년 0개월',
  email: 'minji.kim@tenone.biz',
  phone: '010-1234-5678',
};

const MOCK_ATTENDANCE = {
  workDays: 19,
  late: 1,
  earlyLeave: 0,
  remote: 4,
  remainVacation: 12,
  totalVacation: 15,
  usedVacation: 3,
};

const MOCK_WEEKLY = [
  { day: '월', date: '03/24', in: '09:02', out: '18:15', status: 'normal' },
  { day: '화', date: '03/25', in: '08:55', out: '19:30', status: 'normal' },
  { day: '수', date: '03/26', in: '09:00', out: '18:00', status: 'remote' },
  { day: '목', date: '03/27', in: '09:18', out: '18:45', status: 'late' },
  { day: '금', date: '03/28', in: '08:50', out: '18:00', status: 'normal' },
];

const MOCK_SALARY = {
  month: '2026년 3월',
  base: 3200000,
  bonus: 200000,
  deduction: 450000,
  netPay: 2950000,
};

const MOCK_TRAINING = [
  { id: 'tr1', name: 'AI 마케팅 실무', completedAt: '2026-02-15', hours: 16, passed: true },
  { id: 'tr2', name: '데이터 분석 기초', completedAt: '2025-11-20', hours: 24, passed: true },
  { id: 'tr3', name: '리더십 워크숍', completedAt: '2025-08-10', hours: 8, passed: true },
];

const MOCK_CERTS = [
  { id: 'c1', name: '정보처리기사', issuer: '한국산업인력공단', date: '2023-06-15' },
  { id: 'c2', name: 'Google Analytics 자격증', issuer: 'Google', date: '2024-09-20' },
  { id: 'c3', name: 'SQLD', issuer: '한국데이터산업진흥원', date: '2023-12-01' },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

export default function MyHRPage() {
  const { member, isDemo } = useWIO();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<typeof MOCK_PROFILE | null>(null);
  const [attendance, setAttendance] = useState<typeof MOCK_ATTENDANCE | null>(null);
  const [weekly, setWeekly] = useState<typeof MOCK_WEEKLY>([]);
  const [salary, setSalary] = useState<typeof MOCK_SALARY | null>(null);
  const [training, setTraining] = useState<typeof MOCK_TRAINING>([]);
  const [certs, setCerts] = useState<typeof MOCK_CERTS>([]);

  useEffect(() => {
    if (isDemo) {
      setProfile(MOCK_PROFILE);
      setAttendance(MOCK_ATTENDANCE);
      setWeekly(MOCK_WEEKLY);
      setSalary(MOCK_SALARY);
      setTraining(MOCK_TRAINING);
      setCerts(MOCK_CERTS);
    }
    setLoading(false);
  }, [isDemo]);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">내 인사 기록</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* MY 탭 네비게이션 */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {MY_TABS.map(tab => (
          <Link key={tab.href} href={tab.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              tab.href === '/wio/app/my/hr'
                ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:bg-white/5'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <h1 className="text-xl font-bold mb-6">내 인사 기록</h1>

      <div className="space-y-4">
        {/* 인사 정보 */}
        {profile && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <User size={15} className="text-indigo-400" /> 인사 정보
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: '이름', value: profile.name },
                { label: '부서', value: profile.department },
                { label: '직급', value: profile.position },
                { label: '사원번호', value: profile.employeeNo },
                { label: '입사일', value: profile.joinDate },
                { label: '근속기간', value: profile.tenure },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 근태 요약 */}
        {attendance && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock size={15} className="text-emerald-400" /> 이번 달 근태 요약
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {[
                { label: '출근일', value: attendance.workDays, color: 'text-white' },
                { label: '지각', value: attendance.late, color: attendance.late > 0 ? 'text-amber-400' : 'text-white' },
                { label: '조퇴', value: attendance.earlyLeave, color: 'text-white' },
                { label: '재택', value: attendance.remote, color: 'text-blue-400' },
                { label: '잔여 휴가', value: `${attendance.remainVacation}일`, color: 'text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="rounded-lg bg-white/[0.03] p-3 text-center">
                  <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={12} />
              <span>연차: {attendance.usedVacation}일 사용 / {attendance.totalVacation}일 전체</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(attendance.remainVacation / attendance.totalVacation) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* 이번 주 근무 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Briefcase size={15} className="text-blue-400" /> 이번 주 근무
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-white/5">
                  <th className="text-left py-2 px-2">요일</th>
                  <th className="text-left py-2 px-2">날짜</th>
                  <th className="text-left py-2 px-2">출근</th>
                  <th className="text-left py-2 px-2">퇴근</th>
                  <th className="text-left py-2 px-2">상태</th>
                </tr>
              </thead>
              <tbody>
                {weekly.map(w => (
                  <tr key={w.day} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 px-2 font-medium">{w.day}</td>
                    <td className="py-2.5 px-2 text-slate-400">{w.date}</td>
                    <td className="py-2.5 px-2">{w.in}</td>
                    <td className="py-2.5 px-2">{w.out}</td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        w.status === 'late' ? 'bg-amber-500/10 text-amber-400' :
                        w.status === 'remote' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {w.status === 'late' ? '지각' : w.status === 'remote' ? '재택' : '정상'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 급여 */}
        {salary && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={15} className="text-violet-400" /> 급여 명세 요약
              </h2>
              <span className="text-xs text-slate-500">{salary.month}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[
                { label: '기본급', value: formatCurrency(salary.base), color: '' },
                { label: '수당', value: `+${formatCurrency(salary.bonus)}`, color: 'text-emerald-400' },
                { label: '공제', value: `-${formatCurrency(salary.deduction)}`, color: 'text-red-400' },
                { label: '실수령액', value: formatCurrency(salary.netPay), color: 'text-indigo-400 font-bold' },
              ].map(item => (
                <div key={item.label} className="rounded-lg bg-white/[0.03] p-3">
                  <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                  <div className={`text-sm ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">상세 보기 &rarr;</button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* 교육 이력 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <GraduationCap size={15} className="text-amber-400" /> 교육 이력
            </h2>
            <div className="space-y-2">
              {training.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.completedAt} | {t.hours}시간</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    t.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>{t.passed ? '수료' : '미수료'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 자격증 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Award size={15} className="text-emerald-400" /> 보유 자격증
            </h2>
            <div className="space-y-2">
              {certs.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.issuer}</div>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">{c.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
