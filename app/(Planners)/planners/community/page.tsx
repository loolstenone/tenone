import type { Metadata } from "next";
import { CommunityView } from "@/features/planners/CommunityView";

export const metadata: Metadata = {
    title: "Community",
    description: "Planner's Planner를 쓰는 사람들의 후기·사례·제안·일상.",
};

export default function PlannersCommunityPage() {
    return (
        <div className="bg-[#FAFAF7] min-h-screen">
            <CommunityView />
        </div>
    );
}
