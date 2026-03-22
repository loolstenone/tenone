"use client";

import { useState } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Building2,
  Users,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  type: "division" | "team";
  children?: Department[];
}

const initialDepartments: Department[] = [
  {
    id: "d1",
    name: "관리부문",
    type: "division",
    children: [
      { id: "t1", name: "인사팀", type: "team" },
      { id: "t2", name: "인재개발팀", type: "team" },
      { id: "t3", name: "재무팀", type: "team" },
    ],
  },
  {
    id: "d2",
    name: "사업부문",
    type: "division",
    children: [
      { id: "t4", name: "마케팅팀", type: "team" },
      { id: "t5", name: "파트너십팀", type: "team" },
    ],
  },
  {
    id: "d3",
    name: "제작부문",
    type: "division",
    children: [
      { id: "t6", name: "콘텐츠팀", type: "team" },
      { id: "t7", name: "AI팀", type: "team" },
    ],
  },
  {
    id: "d4",
    name: "지원부문",
    type: "division",
    children: [{ id: "t8", name: "커뮤니티팀", type: "team" }],
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(initialDepartments.map((d) => d.id))
  );
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "addDivision" | "addTeam" | "edit";
    parentId?: string;
    item?: Department;
  }>({ open: false, mode: "addDivision" });
  const [inputValue, setInputValue] = useState("");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddDivision = () => {
    setModal({ open: true, mode: "addDivision" });
    setInputValue("");
  };

  const openAddTeam = (parentId: string) => {
    setModal({ open: true, mode: "addTeam", parentId });
    setInputValue("");
  };

  const openEdit = (item: Department, parentId?: string) => {
    setModal({ open: true, mode: "edit", item, parentId });
    setInputValue(item.name);
  };

  const handleSave = () => {
    if (!inputValue.trim()) return;
    if (modal.mode === "addDivision") {
      setDepartments((prev) => [
        ...prev,
        {
          id: `d${Date.now()}`,
          name: inputValue.trim(),
          type: "division",
          children: [],
        },
      ]);
    } else if (modal.mode === "addTeam" && modal.parentId) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === modal.parentId
            ? {
                ...d,
                children: [
                  ...(d.children || []),
                  { id: `t${Date.now()}`, name: inputValue.trim(), type: "team" },
                ],
              }
            : d
        )
      );
    } else if (modal.mode === "edit" && modal.item) {
      const itemId = modal.item.id;
      if (modal.item.type === "division") {
        setDepartments((prev) =>
          prev.map((d) => (d.id === itemId ? { ...d, name: inputValue.trim() } : d))
        );
      } else {
        setDepartments((prev) =>
          prev.map((d) => ({
            ...d,
            children: d.children?.map((t) =>
              t.id === itemId ? { ...t, name: inputValue.trim() } : t
            ),
          }))
        );
      }
    }
    setModal({ open: false, mode: "addDivision" });
  };

  const handleDelete = (id: string, type: "division" | "team") => {
    if (type === "division") {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } else {
      setDepartments((prev) =>
        prev.map((d) => ({
          ...d,
          children: d.children?.filter((t) => t.id !== id),
        }))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">부서 관리</h2>
          <p className="mt-1 text-xs text-neutral-500">
            조직의 부문 및 팀 구조를 관리합니다
          </p>
        </div>
        <button
          onClick={openAddDivision}
          className="flex items-center gap-1 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-3 w-3" /> 부문 추가
        </button>
      </div>

      <div className="border border-neutral-200 bg-white">
        {departments.map((div) => (
          <div key={div.id}>
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleExpand(div.id)}
                  className="p-0.5 text-neutral-400 hover:text-neutral-600"
                >
                  {expanded.has(div.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <Building2 className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-800">
                  {div.name}
                </span>
                <span className="text-xs text-neutral-400">
                  ({div.children?.length || 0}개 팀)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openAddTeam(div.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="h-3 w-3" /> 팀 추가
                </button>
                <button
                  onClick={() => openEdit(div)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(div.id, "division")}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {expanded.has(div.id) &&
              div.children?.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between border-b border-neutral-50 py-2 pl-12 pr-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-neutral-300" />
                    <span className="text-sm text-neutral-600">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(team, div.id)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id, "team")}
                      className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-80 bg-white border border-neutral-200 shadow-lg">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-800">
                {modal.mode === "addDivision"
                  ? "부문 추가"
                  : modal.mode === "addTeam"
                  ? "팀 추가"
                  : "수정"}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">명칭</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                  placeholder="명칭을 입력하세요"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModal({ open: false, mode: "addDivision" })}
                  className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
