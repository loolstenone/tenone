import { redirect } from "next/navigation";

/**
 * Whole See > 소스 — redirect to 외부 리소스 관리 허브
 *
 * 체계 재정비 (CLAUDE.md):
 *  - UMS > 외부 리소스 = 편집 허브 (CRUD · Add · Verify)
 *  - INTEL > Whole See = 운영 모니터링 (편집 UI 제거)
 */
export default function WholeSeeSourcesRedirect() {
    redirect("/intra/ums/external/sources");
}
