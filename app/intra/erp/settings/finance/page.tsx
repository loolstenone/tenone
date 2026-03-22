"use client";

import { useState } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";

interface Account {
  id: string;
  code: string;
  name: string;
  children?: Account[];
}

const initialAccounts: Account[] = [
  {
    id: "a1",
    code: "1",
    name: "자산",
    children: [
      { id: "a11", code: "11", name: "유동자산" },
      { id: "a12", code: "12", name: "고정자산" },
    ],
  },
  {
    id: "a2",
    code: "2",
    name: "부채",
    children: [{ id: "a21", code: "21", name: "유동부채" }],
  },
  {
    id: "a3",
    code: "3",
    name: "자본",
    children: [],
  },
  {
    id: "a4",
    code: "4",
    name: "수익",
    children: [{ id: "a41", code: "41", name: "매출" }],
  },
  {
    id: "a5",
    code: "5",
    name: "비용",
    children: [
      { id: "a51", code: "51", name: "인건비" },
      { id: "a52", code: "52", name: "복리후생비" },
      { id: "a53", code: "53", name: "여비교통비" },
      { id: "a54", code: "54", name: "접대비" },
      { id: "a55", code: "55", name: "광고선전비" },
    ],
  },
];

export default function FinanceSettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(initialAccounts.map((a) => a.id))
  );
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "addParent" | "addChild" | "edit";
    parentId?: string;
    item?: Account;
  }>({ open: false, mode: "addParent" });
  const [nameValue, setNameValue] = useState("");
  const [codeValue, setCodeValue] = useState("");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddParent = () => {
    setModal({ open: true, mode: "addParent" });
    setNameValue("");
    setCodeValue("");
  };

  const openAddChild = (parentId: string) => {
    setModal({ open: true, mode: "addChild", parentId });
    setNameValue("");
    setCodeValue("");
  };

  const openEdit = (item: Account, parentId?: string) => {
    setModal({ open: true, mode: "edit", item, parentId });
    setNameValue(item.name);
    setCodeValue(item.code);
  };

  const handleSave = () => {
    if (!nameValue.trim()) return;
    if (modal.mode === "addParent") {
      setAccounts((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          code: codeValue.trim(),
          name: nameValue.trim(),
          children: [],
        },
      ]);
    } else if (modal.mode === "addChild" && modal.parentId) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === modal.parentId
            ? {
                ...a,
                children: [
                  ...(a.children || []),
                  {
                    id: `a${Date.now()}`,
                    code: codeValue.trim(),
                    name: nameValue.trim(),
                  },
                ],
              }
            : a
        )
      );
    } else if (modal.mode === "edit" && modal.item) {
      const itemId = modal.item.id;
      if (modal.parentId) {
        setAccounts((prev) =>
          prev.map((a) => ({
            ...a,
            children: a.children?.map((c) =>
              c.id === itemId
                ? { ...c, name: nameValue.trim(), code: codeValue.trim() }
                : c
            ),
          }))
        );
      } else {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === itemId
              ? { ...a, name: nameValue.trim(), code: codeValue.trim() }
              : a
          )
        );
      }
    }
    setModal({ open: false, mode: "addParent" });
  };

  const handleDelete = (id: string, isChild: boolean) => {
    if (isChild) {
      setAccounts((prev) =>
        prev.map((a) => ({
          ...a,
          children: a.children?.filter((c) => c.id !== id),
        }))
      );
    } else {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">계정과목 관리</h2>
          <p className="mt-1 text-xs text-neutral-500">
            회계 계정과목 체계를 관리합니다
          </p>
        </div>
        <button
          onClick={openAddParent}
          className="flex items-center gap-1 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-3 w-3" /> 대분류 추가
        </button>
      </div>

      <div className="border border-neutral-200 bg-white">
        <div className="grid grid-cols-12 border-b border-neutral-200 px-4 py-2 text-xs text-neutral-500 uppercase tracking-wider">
          <div className="col-span-2">코드</div>
          <div className="col-span-7">계정명</div>
          <div className="col-span-3 text-right">작업</div>
        </div>
        {accounts.map((acct) => (
          <div key={acct.id}>
            <div className="grid grid-cols-12 items-center border-b border-neutral-100 px-4 py-2.5 hover:bg-neutral-50 transition-colors">
              <div className="col-span-2 flex items-center gap-2">
                <button
                  onClick={() => toggleExpand(acct.id)}
                  className="p-0.5 text-neutral-400 hover:text-neutral-600"
                >
                  {expanded.has(acct.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <span className="text-xs font-mono text-neutral-400">
                  {acct.code}
                </span>
              </div>
              <div className="col-span-7">
                <span className="text-sm font-medium text-neutral-800">
                  {acct.name}
                </span>
                <span className="ml-2 text-xs text-neutral-400">
                  ({acct.children?.length || 0})
                </span>
              </div>
              <div className="col-span-3 flex items-center justify-end gap-1">
                <button
                  onClick={() => openAddChild(acct.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="h-3 w-3" /> 하위
                </button>
                <button
                  onClick={() => openEdit(acct)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(acct.id, false)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {expanded.has(acct.id) &&
              acct.children?.map((child) => (
                <div
                  key={child.id}
                  className="grid grid-cols-12 items-center border-b border-neutral-50 py-2 pl-12 pr-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="col-span-2">
                    <span className="text-xs font-mono text-neutral-300">
                      {child.code}
                    </span>
                  </div>
                  <div className="col-span-7">
                    <span className="text-sm text-neutral-600">{child.name}</span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(child, acct.id)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(child.id, true)}
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
                {modal.mode === "addParent"
                  ? "대분류 추가"
                  : modal.mode === "addChild"
                  ? "하위 계정 추가"
                  : "수정"}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">코드</label>
                <input
                  type="text"
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                  placeholder="계정 코드"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">계정명</label>
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                  placeholder="계정명을 입력하세요"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setModal({ open: false, mode: "addParent" })}
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
