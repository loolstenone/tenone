import { NotificationsView } from "@/features/myverse/app/NotificationsView";
import { LaneSubNav, CONNECT_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
    return (
        <>
            <LaneSubNav tabs={CONNECT_LANE_TABS} />
            <NotificationsView />
        </>
    );
}
