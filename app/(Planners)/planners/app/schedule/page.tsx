import { ClientRedirect } from "@/components/ClientRedirect";

// 일정(캘린더 약속·기념일)은 월간·오늘·주간 화면에서 보고 넣는다 (같은 CalendarEntryEditor). 별도 '일정' 화면은 월간과 겹쳐 뺐다 (2026-10-14)
// 옛 링크·북마크는 월간으로
export default function PlannersScheduleRedirect() {
    return <ClientRedirect to="/planners/app/monthly" />;
}
