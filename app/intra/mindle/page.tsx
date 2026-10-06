import { redirect } from "next/navigation";

/** 트렌드 뷰 중복 → Intelligence > Whole See > 트렌드 카드 (2026-10-05 인트라 3단계 통합) */
export default function Redirect() {
    redirect("/intra/intel/wholesee/trends");
}
