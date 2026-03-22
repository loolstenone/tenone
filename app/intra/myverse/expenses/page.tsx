"use client";

import { useState } from "react";
import {
  Receipt,
  Plus,
  ChevronDown,
  ChevronUp,
  Upload,
  Car,
  UtensilsCrossed,
  Package,
} from "lucide-react";

type ExpenseStatus = "승인대기" | "승인" | "지급완료";
type ExpenseCategory = "교통" | "식비" | "사무용품";

interface ExpenseItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  status: ExpenseStatus;
}

const expenses: ExpenseItem[] = [
  { id: "e1", date: "2026-03-20", description: "클라이언트 미팅 택시비", amount: 35000, category: "교통", status: "승인대기" },
  { id: "e2", date: "2026-03-18", description: "파트너사 미팅 식비", amount: 85000, category: "식비", status: "승인대기" },
  { id: "e3", date: "2026-03-15", description: "출장 교통비 (KTX)", amount: 85000, category: "교통", status: "승인" },
  { id: "e4", date: "2026-03-12", description: "팀 점심 식사", amount: 100000, category: "식비", status: "지급완료" },
  { id: "e5", date: "2026-03-10", description: "사무용품 구매 (문구류)", amount: 45000, category: "사무용품", status: "지급완료" },
];

const statusStyle: Record<ExpenseStatus, string> = {
  승인대기: "bg-amber-50 text-amber-600",
  승인: "bg-blue-50 text-blue-600",
  지급완료: "bg-green-50 text-green-600",
};

const categoryIcon: Record<ExpenseCategory, typeof Car> = {
  교통: Car,
  식비: UtensilsCrossed,
  사무용품: Package,
};

const categoryTotals: { category: ExpenseCategory; total: number }[] = [
  { category: "교통", total: 120000 },
  { category: "식비", total: 185000 },
  { category: "사무용품", total: 45000 },
];

function formatKRW(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function MyExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("교통");

  const pendingCount = expenses.filter((e) => e.status === "승인대기").length;
  const thisMonthTotal = 350000;

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-neutral-700" />
            <h1 className="text-base font-semibold text-neutral-800">
              내 경비
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
          >
            <Plus className="h-3.5 w-3.5" />
            경비 청구
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="mb-1 text-xs text-neutral-400">미처리 건수</p>
            <p className="text-2xl font-bold text-neutral-800">
              {pendingCount}건
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="mb-1 text-xs text-neutral-400">이번 달 총 경비</p>
            <p className="text-2xl font-bold text-neutral-800">
              {formatKRW(thisMonthTotal)}
            </p>
          </div>
        </div>

        {/* Expense Form (expandable) */}
        {showForm && (
          <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-700">
              경비 청구서 작성
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  날짜
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  카테고리
                </label>
                <select
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value as ExpenseCategory)
                  }
                  className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 outline-none focus:border-neutral-400"
                >
                  <option value="교통">교통</option>
                  <option value="식비">식비</option>
                  <option value="사무용품">사무용품</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  내용
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="경비 사용 내용을 입력하세요"
                  className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  금액
                </label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  영수증 첨부
                </label>
                <div className="flex h-[30px] items-center justify-center rounded-md border border-dashed border-neutral-300 text-xs text-neutral-400">
                  <Upload className="mr-1 h-3 w-3" />
                  파일 선택
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50"
              >
                취소
              </button>
              <button className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700">
                청구하기
              </button>
            </div>
          </div>
        )}

        {/* Expense List */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            경비 내역
          </h2>
          <div className="space-y-2">
            {expenses.map((exp) => {
              const Icon = categoryIcon[exp.category];
              return (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                      <Icon className="h-3.5 w-3.5 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-700">
                        {exp.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>{exp.date}</span>
                        <span className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-500">
                          {exp.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-700">
                      {formatKRW(exp.amount)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[exp.status]}`}
                    >
                      {exp.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Totals */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            이번 달 카테고리별 합계
          </h2>
          <div className="space-y-2">
            {categoryTotals.map((ct) => {
              const Icon = categoryIcon[ct.category];
              const pct = Math.round((ct.total / thisMonthTotal) * 100);
              return (
                <div key={ct.category}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-neutral-500" />
                      <span className="text-xs text-neutral-600">
                        {ct.category}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-neutral-700">
                      {formatKRW(ct.total)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-neutral-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
