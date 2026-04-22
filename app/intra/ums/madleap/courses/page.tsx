"use client";

import { Construction } from "lucide-react";

export default function MadleapCoursesPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">교육 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">MADLeap 교육 과정 · 스터디룸 관리</p>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center border border-neutral-200 rounded-lg">
                <Construction className="h-12 w-12 text-neutral-300 mb-4" />
                <p className="text-sm text-neutral-400">교육 관리 기능 준비 중</p>
                <p className="text-xs text-neutral-300 mt-2">스터디룸 · 교육 과정 · 수료 관리</p>
            </div>
        </div>
    );
}
