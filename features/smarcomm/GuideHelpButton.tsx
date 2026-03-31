'use client';

import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { GUIDES } from '@/lib/smarcomm/guide-data';
import { GUIDE_SECTIONS } from '@/lib/smarcomm/guide-sections';

const MENU_GUIDE_MAP: Record<string, string> = {
  '/dashboard': 'process-overview',
  '/dashboard/funnel': 'breaking-funnel-guide',
  '/dashboard/scan': 'site-scan',
  '/dashboard/traffic': 'traffic-guide',
  '/dashboard/analytics': 'analytics-guide',
  '/dashboard/reports': 'campaign-report-guide',
  '/dashboard/data-reports': 'data-report-guide',
  '/dashboard/geo': 'geo-overview-guide',
  '/dashboard/geo/competitors': 'geo-competitors-guide',
  '/dashboard/geo/prompts': 'geo-prompts-guide',
  '/dashboard/geo/brand': 'geo-brand-guide',
  '/dashboard/geo/tracking': 'geo-tracking-guide',
  '/dashboard/creative': 'creative',
  '/dashboard/content': 'content-guide',
  '/dashboard/advisor': 'advisor-guide',
  '/dashboard/crm': 'crm-guide',
  '/dashboard/crm/kakao': 'kakao-guide',
  '/dashboard/crm/email': 'email-automation',
  '/dashboard/crm/push': 'push-setup',
  '/dashboard/abtest': 'abtest-guide',
  '/dashboard/journey': 'journey-guide',
  '/dashboard/cohort': 'cohort',
  '/dashboard/events': 'events-guide',
  '/dashboard/workflow/projects': 'project-guide',
  '/dashboard/workflow/kanban': 'kanban-guide',
  '/dashboard/calendar': 'calendar-guide',
  '/dashboard/workflow/pipeline': 'pipeline-guide',
  '/dashboard/archive': 'archive-guide',
  '/dashboard/campaigns': 'campaigns-guide',
  '/dashboard/workflow/automation': 'automation-guide',
  '/dashboard/admin': 'admin-guide',
  '/dashboard/workflow': 'kanban-guide',
  '/dashboard/profile': 'workspace-guide',
};

export default function GuideHelpButton() {
  const pathname = usePathname();
  const guideId = MENU_GUIDE_MAP[pathname];
  if (!guideId) return null;

  const guide = GUIDES.find(g => g.id === guideId);
  if (!guide) return null;

  const openGuide = () => {
    window.dispatchEvent(new CustomEvent('open-guide-popup', {
      detail: {
        title: guide.title,
        desc: guide.description,
        steps: guide.steps.map(s => s.content),
        sections: GUIDE_SECTIONS[guide.id] || guide.sections,
      }
    }));
  };

  return (
    <button onClick={openGuide} title="이 메뉴 사용법 보기"
      className="inline-flex items-center justify-center rounded-full w-6 h-6 text-text-muted/50 hover:text-point hover:bg-point/10 transition-colors print:hidden">
      <HelpCircle size={16} />
    </button>
  );
}
