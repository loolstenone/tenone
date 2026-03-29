'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Receipt, Wallet, TrendingUp, Shield, CalendarDays,
  ChevronDown, ChevronUp, DollarSign, Building2
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

const MOCK_PAYSLIP = {
  month: '2026년 3월',
  baseSalary: 4200000,
  positionAllowance: 300000,
  overtimePay: 180000,
  mealAllowance: 100000,
  nationalPension: 189000,
  healthInsurance: 152100,
  employmentInsurance: 38880,
  incomeTax: 215000,
  localTax: 21500,
};

const MOCK_MONTHLY = [
  { month: '2025-10', net: 3980000 },
  { month: '2025-11', net: 3980000 },
  { month: '2025-12', net: 4230000 },
  { month: '2026-01', net: 3980000 },
  { month: '2026-02', net: 4163520 },
  { month: '2026-03', net: 4163520 },
];

const MOCK_STAFF_PAYROLL = [
  { id: '1', name: '김민수', department: '개발팀', baseSalary: 4200000, net: 4163520, status: 'paid' },
  { id: '2', name: '이지은', department: '개발팀', baseSalary: 3800000, net: 3765000, status: 'paid' },
  { id: '3', name: '박서준', department: '디자인팀', baseSalary: 3500000, net: 3468000, status: 'pending' },
  { id: '4', name: '최유나', department: '마케팅팀', baseSalary: 3200000, net: 3170000, status: 'paid' },
  { id: '5', name: '정해인', department: '경영지원팀', baseSalary: 3000000, net: 2972000, status: 'pending' },
];

function formatKRW(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

export default function PayrollPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [payslip, setPayslip] = useState<typeof MOCK_PAYSLIP | null>(null);
  const [monthly, setMonthly] = useState<typeof MOCK_MONTHLY>([]);
  const [staffPayroll, setStaffPayroll] = useState<typeof MOCK_STAFF_PAYROLL>([]);
  const [showDetail, setShowDetail] = useState(false);
  const isAdmin = member?.role === 'admin' || member?.role === 'owner';

  // Supabase에서 급여 데이터 로드
  const loadPayroll = useCallback(async () => {
    if (isDemo) {
      setPayslip(MOCK_PAYSLIP);
      setMonthly(MOCK_MONTHLY);
      setStaffPayroll(MOCK_STAFF_PAYROLL);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('payroll')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        // 최신 급여 명세서
        const latest = data[0];
        setPayslip({
          month: latest.month || MOCK_PAYSLIP.month,
          baseSalary: latest.base_salary ?? MOCK_PAYSLIP.baseSalary,
          positionAllowance: latest.position_allowance ?? MOCK_PAYSLIP.positionAllowance,
          overtimePay: latest.overtime_pay ?? MOCK_PAYSLIP.overtimePay,
          mealAllowance: latest.meal_allowance ?? MOCK_PAYSLIP.mealAllowance,
          nationalPension: latest.national_pension ?? MOCK_PAYSLIP.nationalPension,
          healthInsurance: latest.health_insurance ?? MOCK_PAYSLIP.healthInsurance,
          employmentInsurance: latest.employment_insurance ?? MOCK_PAYSLIP.employmentInsurance,
          incomeTax: latest.income_tax ?? MOCK_PAYSLIP.incomeTax,
          localTax: latest.local_tax ?? MOCK_PAYSLIP.localTax,
        });
        // 전체 직원 급여 대장
        setStaffPayroll(data.map((row: any) => ({
          id: row.id,
          name: row.member_name || '',
          department: row.department || '',
          baseSalary: row.base_salary || 0,
          net: row.net_pay || 0,
          status: row.status || 'pending',
        })));
        setMonthly(MOCK_MONTHLY); // 월별 추이는 별도 집계 필요
      } else {
        setPayslip(MOCK_PAYSLIP);
        setMonthly(MOCK_MONTHLY);
        setStaffPayroll(MOCK_STAFF_PAYROLL);
      }
    } catch {
      setPayslip(MOCK_PAYSLIP);
      setMonthly(MOCK_MONTHLY);
      setStaffPayroll(MOCK_STAFF_PAYROLL);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => {
    if (!tenant) return;
    loadPayroll();
  }, [tenant, loadPayroll]);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">급여관리</h1>
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

  const totalEarnings = payslip ? payslip.baseSalary + payslip.positionAllowance + payslip.overtimePay + payslip.mealAllowance : 0;
  const totalDeductions = payslip ? payslip.nationalPension + payslip.healthInsurance + payslip.employmentInsurance + payslip.incomeTax + payslip.localTax : 0;
  const netPay = totalEarnings - totalDeductions;
  const maxNet = Math.max(...monthly.map(m => m.net), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">급여관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-PAY</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={14} />
          <span>급여 지급일: 매월 25일</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Payslip Summary */}
        {payslip && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Receipt size={15} className="text-indigo-400" /> {payslip.month} 급여 명세서
              </h2>
              <button onClick={() => setShowDetail(!showDetail)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                상세 {showDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-center">
                <div className="text-[10px] text-emerald-400 mb-1">지급액</div>
                <div className="text-lg font-bold text-emerald-400">{formatKRW(totalEarnings)}</div>
              </div>
              <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3 text-center">
                <div className="text-[10px] text-red-400 mb-1">공제액</div>
                <div className="text-lg font-bold text-red-400">{formatKRW(totalDeductions)}</div>
              </div>
              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3 text-center">
                <div className="text-[10px] text-indigo-400 mb-1">실수령액</div>
                <div className="text-lg font-bold text-indigo-400">{formatKRW(netPay)}</div>
              </div>
            </div>

            {/* Detail Breakdown */}
            {showDetail && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <h3 className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">지급 항목</h3>
                  <div className="space-y-1.5">
                    {[
                      { label: '기본급', value: payslip.baseSalary },
                      { label: '직책수당', value: payslip.positionAllowance },
                      { label: '시간외수당', value: payslip.overtimePay },
                      { label: '식대', value: payslip.mealAllowance },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-slate-400">{item.label}</span>
                        <span>{formatKRW(item.value)}원</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2">공제 항목</h3>
                  <div className="space-y-1.5">
                    {[
                      { label: '국민연금', value: payslip.nationalPension },
                      { label: '건강보험', value: payslip.healthInsurance },
                      { label: '고용보험', value: payslip.employmentInsurance },
                      { label: '소득세', value: payslip.incomeTax },
                      { label: '지방소득세', value: payslip.localTax },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-red-400">-{formatKRW(item.value)}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monthly Trend */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-amber-400" /> 월별 실수령액 추이
          </h2>
          <div className="flex items-end gap-2 h-36">
            {monthly.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">{formatKRW(m.net)}</span>
                <div className="w-full rounded-t-md overflow-hidden" style={{ height: `${(m.net / maxNet) * 100}%`, minHeight: '4px' }}>
                  <div className={`h-full ${i === monthly.length - 1 ? 'bg-indigo-500' : 'bg-indigo-500/40'}`} />
                </div>
                <span className="text-[10px] text-slate-500">{m.month.split('-')[1]}월</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Insurances */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Shield size={15} className="text-blue-400" /> 4대보험 상세
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: '국민연금', rate: '4.5%', amount: payslip?.nationalPension || 0, color: 'text-violet-400 bg-violet-500/10' },
              { label: '건강보험', rate: '3.545%', amount: payslip?.healthInsurance || 0, color: 'text-blue-400 bg-blue-500/10' },
              { label: '고용보험', rate: '0.9%', amount: payslip?.employmentInsurance || 0, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: '산재보험', rate: '사업주 부담', amount: 0, color: 'text-amber-400 bg-amber-500/10' },
            ].map(ins => (
              <div key={ins.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-block mb-2 ${ins.color}`}>{ins.label}</div>
                <div className="text-sm font-bold">{ins.amount > 0 ? `${formatKRW(ins.amount)}원` : '-'}</div>
                <div className="text-[10px] text-slate-500">{ins.rate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin: Staff Payroll */}
        {isAdmin && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Building2 size={15} className="text-violet-400" /> 전체 급여 대장
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase">이름</th>
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase">부서</th>
                    <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase">기본급</th>
                    <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase">실수령</th>
                    <th className="text-center py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPayroll.map(s => (
                    <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-medium">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.department}</td>
                      <td className="py-2.5 px-3 text-right">{formatKRW(s.baseSalary)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{formatKRW(s.net)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.status === 'paid' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                          {s.status === 'paid' ? '지급완료' : '대기'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
