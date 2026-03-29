"use client";

import { useState } from "react";
import { BoardPage } from "@/components/board";

const BOARDS = [
  { key: "free", label: "자유" },
  { key: "industry", label: "업계소식" },
  { key: "jobs", label: "구인구직" },
  { key: "mentoring", label: "멘토링" },
] as const;

type BoardKey = (typeof BOARDS)[number]["key"];

export default function CommunityPage() {
  const [activeBoard, setActiveBoard] = useState<BoardKey>("free");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 탭 */}
      <div className="sticky top-14 z-30 bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 flex gap-2 py-3 overflow-x-auto">
          {BOARDS.map((b) => (
            <button
              key={b.key}
              onClick={() => setActiveBoard(b.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeBoard === b.key
                  ? "bg-amber-500 text-white"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-amber-300"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시판 */}
      <BoardPage
        site="badak"
        board={activeBoard}
        title={BOARDS.find((b) => b.key === activeBoard)?.label}
        accentColor="#F59E0B"
      />
    </div>
  );
}
