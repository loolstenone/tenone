import { redirect } from "next/navigation";

export default function AppRootPage() {
    redirect("/planners/app/today");
}
