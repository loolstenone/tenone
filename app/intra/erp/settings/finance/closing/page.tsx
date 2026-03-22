"use client";

import { useState } from "react";
import { Calendar, RefreshCw, Clock } from "lucide-react";

interface ClosingSettings {
  fiscalYearStart: string;
  fiscalYearEnd: string;
  closingCycle: "monthly" | "quarterly" | "semiannual" | "annual";
  closingDay: number;
  autoReminder: boolean;
  reminderDaysBefore: number;
}

const cycleLabels: Record<ClosingSettings["closingCycle"], string> = {
  monthly: "월",
  quarterly: "분기",
  semiannual: "반기",
  annual: "연",
};

export default function ClosingSettingsPage() {
  const [settings, setSettings] = useState<ClosingSettings>({
    fiscalYearStart: "01-01",
    fiscalYearEnd: "12-31",
    closingCycle: "monthly",
    closingDay: 5,
    autoReminder: true,
    reminderDaysBefore: 3,
  });

  const [saved, setSaved] = useState(false);

  const update = <K extends keyof ClosingSettings>(
    key: K,
    value: ClosingSettings[K]
  ) => {
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
          <h2 className="text-lg font-bold text-neutral-900">결산 설정</h2>
          <p className="mt-1 text-xs text-neutral-500">
            회계연도 및 결산 주기를 설정합니다
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
        {/* 회계연도 설정 */}
        <div className="border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">회계연도 설정</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">시작일</label>
              <div className="flex items-center gap-2">
                <select
                  value={settings.fiscalYearStart.split("-")[0]}
                  onChange={(e) =>
                    update(
                      "fiscalYearStart",
                      `${e.target.value}-${settings.fiscalYearStart.split("-")[1]}`
                    )
                  }
                  className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={String(i + 1).padStart(2, "0")}>
                      {i + 1}월
                    </option>
                  ))}
                </select>
                <select
                  value={settings.fiscalYearStart.split("-")[1]}
                  onChange={(e) =>
                    update(
                      "fiscalYearStart",
                      `${settings.fiscalYearStart.split("-")[0]}-${e.target.value}`
                    )
                  }
                  className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={String(i + 1).padStart(2, "0")}>
                      {i + 1}일
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">종료일</label>
              <div className="flex items-center gap-2">
                <select
                  value={settings.fiscalYearEnd.split("-")[0]}
                  onChange={(e) =>
                    update(
                      "fiscalYearEnd",
                      `${e.target.value}-${settings.fiscalYearEnd.split("-")[1]}`
                    )
                  }
                  className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={String(i + 1).padStart(2, "0")}>
                      {i + 1}월
                    </option>
                  ))}
                </select>
                <select
                  value={settings.fiscalYearEnd.split("-")[1]}
                  onChange={(e) =>
                    update(
                      "fiscalYearEnd",
                      `${settings.fiscalYearEnd.split("-")[0]}-${e.target.value}`
                    )
                  }
                  className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={String(i + 1).padStart(2, "0")}>
                      {i + 1}일
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            현재 회계연도: 2026년 {parseInt(settings.fiscalYearStart.split("-")[0])}월{" "}
            {parseInt(settings.fiscalYearStart.split("-")[1])}일 ~{" "}
            {parseInt(settings.fiscalYearEnd.split("-")[0])}월{" "}
            {parseInt(settings.fiscalYearEnd.split("-")[1])}일
          </p>
        </div>

        {/* 결산 주기 */}
        <div className="border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">결산 주기</h3>
          </div>
          <div className="flex gap-2">
            {(
              Object.entries(cycleLabels) as [ClosingSettings["closingCycle"], string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => update("closingCycle", key)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  settings.closingCycle === key
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            {settings.closingCycle === "monthly" && "매월 결산을 진행합니다"}
            {settings.closingCycle === "quarterly" &&
              "분기별(3/6/9/12월) 결산을 진행합니다"}
            {settings.closingCycle === "semiannual" &&
              "반기별(6/12월) 결산을 진행합니다"}
            {settings.closingCycle === "annual" && "연 1회 결산을 진행합니다"}
          </p>
        </div>

        {/* 마감일 설정 */}
        <div className="border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">마감일 설정</h3>
          </div>
          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs text-neutral-500 mb-1">
                결산 마감일 (익월 기준)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">익월</span>
                <input
                  type="number"
                  value={settings.closingDay}
                  onChange={(e) => update("closingDay", Number(e.target.value))}
                  min={1}
                  max={28}
                  className="w-20 border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                />
                <span className="text-sm text-neutral-500">일까지</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                예: 1월 결산은 2월 {settings.closingDay}일까지 마감
              </p>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm text-neutral-700">마감 사전 알림</p>
                  <p className="text-xs text-neutral-400">
                    마감일 전 담당자에게 알림 발송
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settings.reminderDaysBefore}
                    onChange={(e) =>
                      update("reminderDaysBefore", Number(e.target.value))
                    }
                    min={1}
                    max={14}
                    className="w-16 border border-neutral-300 px-2 py-1.5 text-sm text-center focus:outline-none focus:border-neutral-500"
                  />
                  <span className="text-xs text-neutral-500">일 전</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 결산 일정 미리보기 */}
        <div className="border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">
            2026년 결산 일정 미리보기
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {settings.closingCycle === "monthly" &&
              Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="border border-neutral-100 px-3 py-2 text-center"
                >
                  <p className="text-xs text-neutral-400">{i + 1}월 결산</p>
                  <p className="text-sm text-neutral-700">
                    {i + 2 > 12 ? 1 : i + 2}월 {settings.closingDay}일
                  </p>
                </div>
              ))}
            {settings.closingCycle === "quarterly" &&
              [3, 6, 9, 12].map((m) => (
                <div
                  key={m}
                  className="border border-neutral-100 px-3 py-2 text-center"
                >
                  <p className="text-xs text-neutral-400">{m}월 결산</p>
                  <p className="text-sm text-neutral-700">
                    {m + 1 > 12 ? 1 : m + 1}월 {settings.closingDay}일
                  </p>
                </div>
              ))}
            {settings.closingCycle === "semiannual" &&
              [6, 12].map((m) => (
                <div
                  key={m}
                  className="border border-neutral-100 px-3 py-2 text-center"
                >
                  <p className="text-xs text-neutral-400">{m}월 결산</p>
                  <p className="text-sm text-neutral-700">
                    {m + 1 > 12 ? 1 : m + 1}월 {settings.closingDay}일
                  </p>
                </div>
              ))}
            {settings.closingCycle === "annual" && (
              <div className="border border-neutral-100 px-3 py-2 text-center">
                <p className="text-xs text-neutral-400">연간 결산</p>
                <p className="text-sm text-neutral-700">
                  1월 {settings.closingDay}일
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
