// 유료화 스위치 SSOT — 모든 요금제는 베타 테스트 기간을 거친 뒤 유료화한다 (2026-10-14 사용자 결정, CLAUDE.md §0.1)
//
// 베타 기간(기본): 결제를 받지 않는다 — 결제 API는 402 paid_launch_pending, 요금제 화면은 베타 안내 + 정식 출시 예정 가격
//   베타 테스터 = 인트라에서 구독 활성 + 만료일 = 베타 종료일 (서비스별 구독 테이블, 결제 없음)
// 유료화 = env NEXT_PUBLIC_PAID_LAUNCH=true — 그 전에 통신판매업 신고·약관·청약철회·자동갱신 고지·사업자 정보 표시(§1.9.4) 완료
// ❌ 이 스위치를 우회하는 결제 경로(새 결제 API·결제 버튼)를 만들지 않는다

import { NextResponse } from "next/server";

export const PAID_LAUNCH = process.env.NEXT_PUBLIC_PAID_LAUNCH === "true";

export const BETA_PRICING_NOTICE = "지금은 베타 테스트 기간입니다. 모든 요금제를 결제 없이 시험하고 있으며, 표시된 가격은 정식 출시 예정 가격입니다.";

/** 결제 API 첫 줄 — 베타 기간이면 거절 응답, 유료화 후엔 null */
export function paymentClosed(): NextResponse | null {
    if (PAID_LAUNCH) return null;
    return NextResponse.json(
        { error: "paid_launch_pending", message: "베타 테스트 기간이라 결제를 받지 않습니다." },
        { status: 402 },
    );
}
