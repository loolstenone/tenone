import { redirect } from "next/navigation";

export const metadata = { title: '기업 고객', description: '기업을 위한 HeRo — 써치 라이트' };

export default function ForBusinessPage() {
    redirect("/hero/search-light");
}
