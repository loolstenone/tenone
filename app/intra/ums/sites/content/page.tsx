import { redirect } from "next/navigation";

/** 콘텐츠 점검 = 게시판과 같은 데이터·같은 화면 → 게시판으로 통합 (2026-10-10 통합 관리 점검). 글 편집은 /intra/ums/sites/content/edit 그대로 */
export default function Redirect() {
    redirect("/intra/ums/sites/boards");
}
