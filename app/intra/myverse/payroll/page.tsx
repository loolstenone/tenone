"use client";

import { useState } from "react";
import {
  Wallet,
  Download,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CreditCard,
} from "lucide-react";

interface PayItem {
  label: string;
  amount: number;
}

const earnings: PayItem[] = [
  { label: "기본급", amount: 4200000 },
  { label: "식대", amount: 200000 },
  { label: "차량유지비", amount: 300000 },
  { label: "직책수당", amount: 300000 },
];

const deductions: PayItem[] = [
  { label: "국민연금", amount: 225000 },
  { label: "건강보험", amount: 175000 },
  { label: "고용보험", amount: 45000 },
  { label: "소득세", amount: 310000 },
  { label: "지방소득세", amount: 65000 },
];

const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0);
const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
const netPay = totalEarnings - totalDeductions;

const recentHistory = [
  { month: "2026-02", net: 4180000 },
  { month: "2026-01", net: 4180000 },
  { month: "2025-12", net: 5480000 },
  { month: "2025-11", net: 4180000 },
  { month: "2025-10", net: 4180000 },
  { month: "2025-09", net: 4180000 },
];

function formatKRW(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function monthLabel(m: string) {
  const [y, mo] = m.split("-");
  return `${y}년 ${parseInt(mo)}월`;
}

export default function MyPayrollPage() {
  const [showBreakdown, setShowBreakdown] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-neutral-700" />
          <h1 className="text-base font-semibold text-neutral-800">내 급여</h1>
        </div>

        {/* This Month Summary */}
        <div className="mb-6 border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400">2026년 3월 급여</p>
              <p className="mt-1 text-2xl font-bold text-neutral-800">
                {formatKRW(netPay)}
              </p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                지급예정 (3/25)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-md bg-neutral-50 p-3">
            <div className="text-center">
              <p className="text-xs text-neutral-400">총 지급액</p>
              <p className="text-sm font-semibold text-neutral-700">
                {formatKRW(totalEarnings)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-400">총 공제액</p>
              <p className="text-sm font-semibold text-red-500">
                -{formatKRW(totalDeductions)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-400">실수령액</p>
              <p className="text-sm font-bold text-neutral-800">
                {formatKRW(netPay)}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-6 border border-neutral-200 bg-white">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex w-full items-center justify-between p-4"
          >
            <h2 className="text-sm font-semibold text-neutral-700">
              급여 상세 내역
            </h2>
            {showBreakdown ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </button>
          {showBreakdown && (
            <div className="border-t border-neutral-100 px-4 pb-4">
              {/* Earnings */}
              <div className="mb-4">
                <p className="mb-2 mt-3 text-xs font-medium text-neutral-500">
                  지급 항목
                </p>
                <div className="space-y-1.5">
                  {earnings.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"
                    >
                      <span className="text-xs text-neutral-600">
                        {item.label}
                      </span>
                      <span className="text-xs font-medium text-neutral-700">
                        {formatKRW(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-neutral-100 px-3 pt-2">
                    <span className="text-xs font-medium text-neutral-700">
                      소계
                    </span>
                    <span className="text-xs font-bold text-neutral-800">
                      {formatKRW(totalEarnings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <p className="mb-2 text-xs font-medium text-neutral-500">
                  공제 항목
                </p>
                <div className="space-y-1.5">
                  {deductions.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"
                    >
                      <span className="text-xs text-neutral-600">
                        {item.label}
                      </span>
                      <span className="text-xs font-medium text-red-500">
                        -{formatKRW(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-neutral-100 px-3 pt-2">
                    <span className="text-xs font-medium text-neutral-700">
                      소계
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      -{formatKRW(totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pension */}
        <div className="mb-6 border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neutral-500" />
              <p className="text-xs text-neutral-500">퇴직연금</p>
            </div>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
              확정급여(DB)
            </span>
          </div>
          <p className="mt-1 text-lg font-bold text-neutral-800">
            {formatKRW(18500000)}
          </p>
        </div>

        {/* Recent History */}
        <div className="mb-6 border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            최근 6개월 실수령액
          </h2>
          <div className="space-y-1.5">
            {recentHistory.map((h) => (
              <div
                key={h.month}
                className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"
              >
                <span className="text-xs text-neutral-500">
                  {monthLabel(h.month)}
                </span>
                <span className="text-xs font-medium text-neutral-700">
                  {formatKRW(h.net)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Download */}
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
          <Download className="h-3.5 w-3.5" />
          급여명세서 다운로드
        </button>
      </div>
    </div>
  );
}
