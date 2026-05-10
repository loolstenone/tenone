import { ContactsView } from "@/features/myverse/planner/ContactsView";
import { LaneSubNav, WORK_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const metadata = { title: "Contacts" };

export default function ContactsPage() {
    return (
        <>
            <LaneSubNav tabs={WORK_LANE_TABS} />
            <ContactsView />
        </>
    );
}
