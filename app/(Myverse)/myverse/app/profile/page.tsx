"use client";

// 마이버스 앱 셸 안의 프로필 페이지 — AppTopNav + AppSideNav 컨텍스트로 렌더
// /myverse/my (외부 마케팅 사이트 다크 컨텍스트)와 동일 콘텐츠, 라이트 테마.

import { MyverseProfileView } from "@/features/myverse/app/MyverseProfileView";

export default function ProfilePage() {
    return <MyverseProfileView dark={false} fullPage={false} />;
}
