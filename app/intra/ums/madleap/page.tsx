"use client";
import { Construction } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Construction className="h-12 w-12 text-neutral-300 mb-4" />
      <h1 className="text-lg font-bold text-neutral-700">MADLeap 관리</h1>
      <p className="text-sm text-neutral-400 mt-2">MADLeap 사이트 서비스 관리</p>
      <p className="text-xs text-neutral-300 mt-4">준비 중입니다</p>
    </div>
  );
}
