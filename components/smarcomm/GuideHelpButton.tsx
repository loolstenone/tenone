'use client';

import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { GUIDES } from '@/lib/smarcomm/guide-data';
import { GUIDE_SECTIONS } from '@/lib/smarcomm/guide-sections';

const MENU_GUIDE_MAP: Record<string, string> = {
  '/dashboard': 'process-overview',
  '/sc/dashboard/funnel': 'breaking-funnel-guide',
  '/sc/dashboard/scan': 'site-scan',
  '/sc/dashboard/traffic': 'traffic-guide',
  '/sc/dashboard/analytics': 'analytics-guide',
  '/sc/dashboard/reports': 'campaign-report-guide',
  '/sc/dashboard/data-reports': 'data-report-guide',
  '/sc/dashboard/geo': 'geo-overview-guide',
  '/sc/dashboard/geo/competitors': 'geo-competitors-guide',
  '/sc/dashboard/geo/prompts': 'geo-prompts-guide',
  '/sc/dashboard/geo/brand': 'geo-brand-guide',
  '/sc/dashboard/geo/tracking': 'geo-tracking-guide',
  '/sc/dashboard/creative': 'creative',
  '/sc/dashboard/content': 'content-guide',
  '/sc/dashboard/advisor': 'advisor-guide',
  '/sc/dashboard/crm': 'crm-guide',
  '/sc/dashboard/crm/kakao': 'kakao-guide',
  '/sc/dashboard/crm/email': 'email-automation',
  '/sc/dashboard/crm/push': 'push-setup',
  '/sc/dashboard/abtest': 'abtest-guide',
  '/sc/dashboard/journey': 'journey-guide',
  '/sc/dashboard/cohort': 'cohort',
  '/sc/dashboard/events': 'events-guide',
  '/sc/dashboard/workflow/projects': 'project-guide',
  '/sc/dashboard/workflow/kanban': 'kanban-guide',
  '/sc/dashboard/calendar': 'calendar-guide',
  '/sc/dashboard/workflow/pipeline': 'pipeline-guide',
  '/sc/dashboard/archive': 'archive-guide',
  '/sc/dashboard/campaigns': 'campaigns-guide',
  '/sc/dashboard/workflow/automation': 'automation-guide',
  '/sc/dashboard/admin': 'admin-guide',
  '/sc/dashboard/workflow': 'kanban-guide',
  '/sc/dashboard/profile': 'workspace-guide',
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
