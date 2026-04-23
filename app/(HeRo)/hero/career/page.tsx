import { redirect } from "next/navigation";

// 기존 커리어 랜딩은 Journey 워크스페이스로 통합됨.
// 이전 링크·외부 유입 보호용 301 redirect.
export default function CareerPage() {
  redirect("/hero/journey");
}
