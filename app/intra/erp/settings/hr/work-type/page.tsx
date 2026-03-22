"use client";

import { useState } from "react";
import { Clock, Coffee, Home, CalendarDays, ToggleLeft, ToggleRight } from "lucide-react";

interface WorkSettings {
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  flexibleWork: boolean;
  remoteWork: boolean;
  annualLeaveBase: number;
}

export default function WorkTypePage() {
  const [settings, setSettings] = useState<WorkSettings>({
    startTime: "09:00",
    endTime: "18:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    flexibleWork: false,
    remoteWork: false,
    annualLeaveBase: 15,
  });

  const [saved, setSaved] = useState(false);

  const update = <K extends keyof WorkSettings>(key: K, value: WorkSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">근무형태 설정</h2>
          <p className="mt-1 text-xs text-neutral-500">
            기본 근무시간 및 근무 정책을 설정합니다
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          {saved ? "저장됨" : "저장"}
        </button>
      </div>

      <div className="space-y-4">
        {/* 기본 근무시간 */}
        <div className="border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">기본 근무시간</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">출근 시간</label>
              <input
                type="time"
                value={settings.startTime}
                onChange={(e) => update("startTime", e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">퇴근 시간</label>
              <input
                type="time"
                value={settings.endTime}
                onChange={(e) => update("endTime", e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            일 근무시간: 8시간 (점심시간 제외)
          </p>
        </div>

        {/* 점심시간 */}
        <div className="border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">점심시간</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">시작</label>
              <input
                type="time"
                value={settings.lunchStart}
                onChange={(e) => update("lunchStart", e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">종료</label>
              <input
                type="time"
                value={settings.lunchEnd}
                onChange={(e) => update("lunchEnd", e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>
        </div>

        {/* 근무 정책 */}
        <div className="border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4">근무 정책</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-700">유연근무제</p>
                  <p className="text-xs text-neutral-400">
                    코어타임 내 자유 출퇴근 허용
                  </p>
                </div>
              </div>
              <button
                onClick={() => update("flexibleWork", !settings.flexibleWork)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {settings.flexibleWork ? (
                  <ToggleRight className="h-7 w-7 text-neutral-900" />
                ) : (
                  <ToggleLeft className="h-7 w-7" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Home className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-700">재택근무</p>
                  <p className="text-xs text-neutral-400">
                    원격 재택근무 허용 여부
                  </p>
                </div>
              </div>
              <button
                onClick={() => update("remoteWork", !settings.remoteWork)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {settings.remoteWork ? (
                  <ToggleRight className="h-7 w-7 text-neutral-900" />
                ) : (
                  <ToggleLeft className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 연차 설정 */}
        <div className="border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">연차 설정</h3>
          </div>
          <div className="max-w-xs">
            <label className="block text-xs text-neutral-500 mb-1">
              연차 기본 일수 (1년 미만)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.annualLeaveBase}
                onChange={(e) => update("annualLeaveBase", Number(e.target.value))}
                className="w-24 border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                min={0}
              />
              <span className="text-sm text-neutral-500">일</span>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              근속 1년 이상 시 근로기준법에 따라 자동 가산
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
