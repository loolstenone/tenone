import { redirect } from "next/navigation";

export const metadata = { title: '퍼스널 브랜딩', description: '나를 설명하는 한 문장과 프로필' };

export default function BrandingPage() {
    redirect("/hero/coaching");
}
