"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

interface BudgetRow {
  id: string;
  department: string;
  labor: number;
  operation: number;
  project: number;
  spent: number;
}

const initialBudgets: BudgetRow[] = [
  { id: "b1", department: "인사팀", labor: 120000, operation: 30000, project: 10000, spent: 68 },
  { id: "b2", department: "인재개발팀", labor: 80000, operation: 25000, project: 15000, spent: 52 },
  { id: "b3", department: "재무팀", labor: 90000, operation: 20000, project: 5000, spent: 71 },
  { id: "b4", department: "마케팅팀", labor: 100000, operation: 50000, project: 80000, spent: 45 },
  { id: "b5", department: "파트너십팀", labor: 70000, operation: 20000, project: 30000, spent: 33 },
  { id: "b6", department: "콘텐츠팀", labor: 110000, operation: 40000, project: 60000, spent: 58 },
  { id: "b7", department: "AI팀", labor: 150000, operation: 60000, project: 100000, spent: 42 },
  { id: "b8", department: "커뮤니티팀", labor: 60000, operation: 15000, project: 20000, spent: 61 },
];

function formatKRW(val: number) {
  return val.toLocaleString("ko-KR");
}

export default function BudgetSettingsPage() {
  const [budgets, setBudgets] = useState<BudgetRow[]>(initialBudgets);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BudgetRow>>({});

  const startEdit = (row: BudgetRow) => {
    setEditId(row.id);
    setEditData({ labor: row.labor, operation: row.operation, project: row.project });
  };

  const saveEdit = () => {
    if (!editId) return;
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === editId
          ? {
              ...b,
              labor: editData.labor ?? b.labor,
              operation: editData.operation ?? b.operation,
              project: editData.project ?? b.project,
            }
          : b
      )
    );
    setEditId(null);
    setEditData({});
  };

  const totalAll = budgets.reduce(
    (acc, b) => ({
      labor: acc.labor + b.labor,
      operation: acc.operation + b.operation,
      project: acc.project + b.project,
      total: acc.total + b.labor + b.operation + b.project,
    }),
    { labor: 0, operation: 0, project: 0, total: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">예산 설정</h2>
        <p className="mt-1 text-xs text-neutral-500">
          부서별 연간 예산을 설정하고 집행률을 관리합니다
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500">총 예산</p>
          <p className="text-lg font-bold text-neutral-900">
            {formatKRW(totalAll.total)}
            <span className="text-xs font-normal text-neutral-400 ml-1">천원</span>
          </p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500">인건비 합계</p>
          <p className="text-lg font-bold text-neutral-900">
            {formatKRW(totalAll.labor)}
            <span className="text-xs font-normal text-neutral-400 ml-1">천원</span>
          </p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500">운영비 합계</p>
          <p className="text-lg font-bold text-neutral-900">
            {formatKRW(totalAll.operation)}
            <span className="text-xs font-normal text-neutral-400 ml-1">천원</span>
          </p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500">프로젝트비 합계</p>
          <p className="text-lg font-bold text-neutral-900">
            {formatKRW(totalAll.project)}
            <span className="text-xs font-normal text-neutral-400 ml-1">천원</span>
          </p>
        </div>
      </div>

      <div className="border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">부서명</th>
              <th className="px-4 py-3 text-right">인건비 (천원)</th>
              <th className="px-4 py-3 text-right">운영비 (천원)</th>
              <th className="px-4 py-3 text-right">프로젝트비 (천원)</th>
              <th className="px-4 py-3 text-right">합계 (천원)</th>
              <th className="px-4 py-3 text-center">집행률</th>
              <th className="px-4 py-3 text-center w-16">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {budgets.map((row) => {
              const total = row.labor + row.operation + row.project;
              const isEditing = editId === row.id;
              return (
                <tr
                  key={row.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                    {row.department}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.labor ?? ""}
                        onChange={(e) =>
                          setEditData((p) => ({ ...p, labor: Number(e.target.value) }))
                        }
                        className="w-24 border border-neutral-300 px-2 py-1 text-xs text-right focus:outline-none focus:border-neutral-500"
                      />
                    ) : (
                      <span className="text-sm text-neutral-600">
                        {formatKRW(row.labor)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.operation ?? ""}
                        onChange={(e) =>
                          setEditData((p) => ({
                            ...p,
                            operation: Number(e.target.value),
                          }))
                        }
                        className="w-24 border border-neutral-300 px-2 py-1 text-xs text-right focus:outline-none focus:border-neutral-500"
                      />
                    ) : (
                      <span className="text-sm text-neutral-600">
                        {formatKRW(row.operation)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.project ?? ""}
                        onChange={(e) =>
                          setEditData((p) => ({
                            ...p,
                            project: Number(e.target.value),
                          }))
                        }
                        className="w-24 border border-neutral-300 px-2 py-1 text-xs text-right focus:outline-none focus:border-neutral-500"
                      />
                    ) : (
                      <span className="text-sm text-neutral-600">
                        {formatKRW(row.project)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-neutral-800">
                    {formatKRW(
                      isEditing
                        ? (editData.labor ?? 0) +
                            (editData.operation ?? 0) +
                            (editData.project ?? 0)
                        : total
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full bg-neutral-400"
                          style={{ width: `${row.spent}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500 w-8 text-right">
                        {row.spent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <button
                        onClick={saveEdit}
                        className="text-xs font-medium text-neutral-900 hover:underline"
                      >
                        저장
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(row)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-300 bg-neutral-50">
              <td className="px-4 py-3 text-sm font-semibold text-neutral-800">
                합계
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-800">
                {formatKRW(totalAll.labor)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-800">
                {formatKRW(totalAll.operation)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-800">
                {formatKRW(totalAll.project)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-bold text-neutral-900">
                {formatKRW(totalAll.total)}
              </td>
              <td className="px-4 py-3 text-center text-xs text-neutral-500">-</td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
