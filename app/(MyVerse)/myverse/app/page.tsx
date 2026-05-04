// /myverse/app — 진입 시 오늘 페이지로 자동 이동
import { redirect } from "next/navigation";
export default function Page() {
    redirect("/myverse/app/today");
}
