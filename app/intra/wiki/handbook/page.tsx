"use client";

import {
  BookMarked,
  Clock,
  CalendarDays,
  Shirt,
  Receipt,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Info,
} from "lucide-react";

/* ── Section Data ── */
const sections = [
  {
    id: "work-hours",
    icon: Clock,
    title: "근무 시간",
    content: [
      { label: "기본 근무", value: "09:00 ~ 18:00 (점심 12:00~13:00)" },
      { label: "유연근무", value: "08:00~10:00 출근, 8시간 근무 후 퇴근" },
      { label: "재택근무", value: "팀 리드 사전 승인 시 주 2회까지 가능" },
      { label: "야근/휴일 근무", value: "사전 승인 필수, 대체휴무 부여" },
    ],
    note: "유연근무 적용 시에도 코어타임(10:00~16:00)에는 반드시 근무해야 합니다.",
  },
  {
    id: "vacation",
    icon: CalendarDays,
    title: "휴가 정책",
    content: [
      { label: "연차", value: "15일 (1년 미만: 월 1일씩 발생)" },
      { label: "반차", value: "오전(09:00~13:00) / 오후(14:00~18:00)" },
      { label: "경조사 휴가", value: "사규에 따라 1~5일" },
      { label: "출산 휴가", value: "90일 (배우자 10일)" },
      { label: "병가", value: "유급 3일, 이후 무급 (진단서 필요)" },
    ],
    note: "연차는 3일 전 신청, 3일 이상 연속 사용 시 1주 전 신청이 원칙입니다.",
  },
  {
    id: "dress-code",
    icon: Shirt,
    title: "복장 규정",
    content: [
      { label: "일반", value: "자율 복장 (캐주얼 가능)" },
      { label: "외부 미팅", value: "비즈니스 캐주얼 권장" },
      { label: "고객사 방문", value: "정장 또는 비즈니스 캐주얼" },
    ],
    note: null,
  },
  {
    id: "expense",
    icon: Receipt,
    title: "경비 처리 절차",
    flow: ["경비 발생", "전자결재 신청", "팀 리드 승인", "재무팀 검토", "정산 완료"],
    content: [
      { label: "법인카드", value: "팀별 법인카드 사용, 사적 사용 금지" },
      { label: "개인 선지급", value: "영수증 첨부 후 전자결재 신청" },
      { label: "정산 주기", value: "매월 말일 마감, 익월 10일 지급" },
      { label: "증빙 필수", value: "세금계산서, 카드전표, 영수증 중 택 1" },
    ],
    note: "10만원 이상 경비는 팀 리드 사전 승인이 필요합니다.",
  },
  {
    id: "communication",
    icon: MessageSquare,
    title: "커뮤니케이션 도구",
    content: [
      { label: "슬랙(Slack)", value: "일상 업무 소통, 채널별 주제 구분" },
      { label: "이메일", value: "공식 문서, 외부 커뮤니케이션" },
      { label: "전자결재", value: "휴가, 경비, 기안 등 공식 승인" },
      { label: "화상회의", value: "Google Meet / Zoom" },
      { label: "위키", value: "사내 지식 관리 (현재 페이지)" },
    ],
    note: "업무 시간 외 슬랙 알림은 DnD 설정을 권장합니다.",
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "보안 정책",
    content: [
      { label: "비밀번호", value: "8자 이상, 영문+숫자+특수문자, 90일마다 변경" },
      { label: "2단계 인증", value: "전사 시스템 필수 적용" },
      { label: "정보 취급", value: "대외비 자료 외부 반출 금지" },
      { label: "개인 기기", value: "업무 자료 개인 기기 저장 금지" },
      { label: "화면 잠금", value: "자리 비움 시 반드시 화면 잠금" },
      { label: "USB/외장 저장장치", value: "사전 승인 없이 사용 금지" },
    ],
    note: "보안 사고 발생 시 즉시 IT팀(it@tenone.biz)에 신고하세요.",
  },
];

export default function HandbookPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookMarked className="w-5 h-5 text-neutral-400" />
          <h1 className="text-2xl font-bold">핸드북</h1>
        </div>
        <p className="text-sm text-neutral-500">
          Ten:One™ 임직원이 알아야 할 기본 규정과 정책을 안내합니다.
        </p>
      </div>

      {/* Quick Nav */}
      <div className="border border-neutral-200 bg-white p-4">
        <p className="text-xs font-semibold text-neutral-400 mb-2">바로가기</p>
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-2.5 py-1.5 border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-neutral-500" />
                </div>
                <h2 className="text-lg font-bold">{s.title}</h2>
              </div>

              {/* Expense Flow Diagram */}
              {"flow" in s && s.flow && (
                <div className="border border-neutral-200 bg-neutral-50 p-4 mb-4">
                  <div className="flex items-center justify-center flex-wrap gap-1">
                    {s.flow.map((step, idx) => (
                      <div key={step} className="flex items-center gap-1">
                        <span className="text-xs bg-white border border-neutral-200 px-3 py-1.5 font-medium">
                          {step}
                        </span>
                        {idx < s.flow.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-neutral-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-neutral-200 bg-white">
                <table className="w-full">
                  <tbody>
                    {s.content.map((row, idx) => (
                      <tr
                        key={row.label}
                        className={idx < s.content.length - 1 ? "border-b border-neutral-100" : ""}
                      >
                        <td className="px-4 py-3 text-xs font-semibold text-neutral-500 w-1/4 align-top">
                          {row.label}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-700">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {s.note && (
                <div className="flex items-start gap-2 mt-2 px-1">
                  <Info className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-neutral-400">{s.note}</p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Important Notice */}
      <div className="border border-neutral-300 bg-neutral-50 p-5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-neutral-700 mb-1">유의사항</p>
          <p className="text-xs text-neutral-500">
            본 핸드북은 주요 정책을 요약한 것이며, 세부 사항은 사내 규정집을 참고하세요.
            규정 변경 시 전사 공지를 통해 안내됩니다.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 pt-6 text-xs text-neutral-400">
        <p>
          문의: HR팀(hr@tenone.biz) | 최종 수정: 2026.03
        </p>
      </div>
    </div>
  );
}
