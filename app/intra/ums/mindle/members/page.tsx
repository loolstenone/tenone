import { redirect } from "next/navigation";
export default function MindleMembersRedirect() {
    redirect("/intra/ums/newsletter/subscribers?site=mindle");
}
