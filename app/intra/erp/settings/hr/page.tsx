"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  order: number;
}

function ItemList({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  items: Item[];
  onAdd: () => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-3 w-3" /> 추가
        </button>
      </div>
      <div className="divide-y divide-neutral-100">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 w-5 text-right">
                {idx + 1}
              </span>
              <span className="text-sm text-neutral-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HRSettingsPage() {
  const [ranks, setRanks] = useState<Item[]>([
    { id: "r1", name: "사원", order: 1 },
    { id: "r2", name: "대리", order: 2 },
    { id: "r3", name: "과장", order: 3 },
    { id: "r4", name: "차장", order: 4 },
    { id: "r5", name: "부장", order: 5 },
    { id: "r6", name: "이사", order: 6 },
    { id: "r7", name: "상무", order: 7 },
    { id: "r8", name: "전무", order: 8 },
    { id: "r9", name: "부사장", order: 9 },
    { id: "r10", name: "사장", order: 10 },
  ]);

  const [positions, setPositions] = useState<Item[]>([
    { id: "p1", name: "팀원", order: 1 },
    { id: "p2", name: "팀장", order: 2 },
    { id: "p3", name: "실장", order: 3 },
    { id: "p4", name: "본부장", order: 4 },
    { id: "p5", name: "대표", order: 5 },
  ]);

  const [editModal, setEditModal] = useState<{
    open: boolean;
    type: "rank" | "position";
    item: Item | null;
  }>({ open: false, type: "rank", item: null });

  const [editValue, setEditValue] = useState("");

  const openAdd = (type: "rank" | "position") => {
    setEditModal({ open: true, type, item: null });
    setEditValue("");
  };

  const openEdit = (type: "rank" | "position", item: Item) => {
    setEditModal({ open: true, type, item });
    setEditValue(item.name);
  };

  const handleSave = () => {
    if (!editValue.trim()) return;
    const { type, item } = editModal;
    if (type === "rank") {
      if (item) {
        setRanks((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, name: editValue.trim() } : r))
        );
      } else {
        setRanks((prev) => [
          ...prev,
          { id: `r${Date.now()}`, name: editValue.trim(), order: prev.length + 1 },
        ]);
      }
    } else {
      if (item) {
        setPositions((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, name: editValue.trim() } : p))
        );
      } else {
        setPositions((prev) => [
          ...prev,
          { id: `p${Date.now()}`, name: editValue.trim(), order: prev.length + 1 },
        ]);
      }
    }
    setEditModal({ open: false, type: "rank", item: null });
  };

  const handleDelete = (type: "rank" | "position", id: string) => {
    if (type === "rank") {
      setRanks((prev) => prev.filter((r) => r.id !== id));
    } else {
      setPositions((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">직급/직책 관리</h2>
        <p className="mt-1 text-xs text-neutral-500">
          조직 내 직급 및 직책 체계를 관리합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ItemList
          title="직급 (Rank)"
          items={ranks}
          onAdd={() => openAdd("rank")}
          onEdit={(item) => openEdit("rank", item)}
          onDelete={(id) => handleDelete("rank", id)}
        />
        <ItemList
          title="직책 (Position)"
          items={positions}
          onAdd={() => openAdd("position")}
          onEdit={(item) => openEdit("position", item)}
          onDelete={(id) => handleDelete("position", id)}
        />
      </div>

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-80 bg-white border border-neutral-200 shadow-lg">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-800">
                {editModal.item ? "수정" : "추가"} -{" "}
                {editModal.type === "rank" ? "직급" : "직책"}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">명칭</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                  placeholder="명칭을 입력하세요"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() =>
                    setEditModal({ open: false, type: "rank", item: null })
                  }
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
