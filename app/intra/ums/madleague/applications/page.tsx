"use client";

import { ApplicationsAdmin } from "../ApplicationsAdmin";

// 사이트 홈의 "매드리거 등록" (lib/brand-site-menus.ts)
export default function Page() {
    return <ApplicationsAdmin fixedTab="applications" />;
}
