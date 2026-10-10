import { redirect } from "next/navigation";

// HeRo 채용 — 아직 콘텐츠 없음. 빈 안내 페이지를 공개하지 않고 Badak 홈으로 보낸다 (§1.1, 2026-10-10). 열 때 이 파일을 실제 페이지로 교체
export default function Page() {
    redirect("/badak");
}
