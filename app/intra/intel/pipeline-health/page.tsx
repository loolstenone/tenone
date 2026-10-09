import { redirect } from "next/navigation";

/** 데이터 헬스 → 운영 상태로 통합 (2026-10-10 Intelligence 3화면 재정의) */
export default function PipelineHealthRedirect() {
    redirect("/intra/intel/health");
}
