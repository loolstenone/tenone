import { SocialFeedView } from "@/features/myverse/app/SocialFeedView";
import { LaneSubNav, CONNECT_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const dynamic = "force-dynamic";

export default function FeedPage() {
    return (
        <>
            <LaneSubNav tabs={CONNECT_LANE_TABS} />
            <SocialFeedView />
        </>
    );
}
