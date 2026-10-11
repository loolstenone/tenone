import { redirect } from "next/navigation";

export const metadata = { title: '오디션', description: 'HeRo 오디션' };

export default function AuditionPage() {
    redirect("/hero/talent-agent");
}
