import type { Metadata } from "next";
import { MailView } from "@/features/myverse/mail/MailView";

export const metadata: Metadata = {
    title: "메일",
};

export const dynamic = "force-dynamic";

export default function MailPage() {
    return <MailView />;
}
