import type { Metadata } from "next";
import { CompaniesView } from "@/features/myverse/planner/CompaniesView";

export const metadata: Metadata = {
    title: "회사",
};

export const dynamic = "force-dynamic";

export default function CompaniesPage() {
    return <CompaniesView />;
}
