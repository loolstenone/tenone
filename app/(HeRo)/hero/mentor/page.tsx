import { redirect } from "next/navigation";

export const metadata = { title: '멘토링', description: '현업 멘토와 함께하는 커리어 멘토링' };

export default function MentorPage() {
    redirect("/hero/coaching");
}
