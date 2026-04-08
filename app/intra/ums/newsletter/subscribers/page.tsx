import { redirect } from "next/navigation";

export default function SubscribersPage() {
    redirect("/intra/ums/newsletter?tab=subscribers");
}
