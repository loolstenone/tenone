'use client';

import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { GUIDES } from '@/lib/smarcomm/guide-data';
import { GUIDE_SECTIONS } from '@/lib/smarcomm/guide-sections';

const MENU_GUIDE_MAP: Record<string, string> = {
  '/smarcomm/dashboard': 'process-overview',
  '/smarcomm/dashboard/funnel': 'breaking-funnel-guide',
  '/smarcomm/dashboard/scan': 'site-scan',
  '/smarcomm/dashboard/traffic': 'traffic-guide',
  '/smarcomm/dashboard/analytics': 'analytics-guide',
  '/smarcomm/dashboard/reports': 'campaign-report-guide',
  '/smarcomm/dashboard/data-reports': 'data-report-guide',
  '/smarcomm/dashboard/geo': 'geo-overview-guide',
  '/smarcomm/dashboard/geo/competitors': 'geo-competitors-guide',
  '/smarcomm/dashboard/geo/prompts': 'geo-prompts-guide',
  '/smarcomm/dashboard/geo/brand': 'geo-brand-guide',
  '/smarcomm/dashboard/geo/tracking': 'geo-tracking-guide',
  '/smarcomm/dashboard/creative': 'creative',
  '/smarcomm/dashboard/content': 'content-guide',
  '/smarcomm/dashboard/advisor': 'advisor-guide',
  '/smarcomm/dashboard/crm': 'crm-guide',
  '/smarcomm/dashboard/crm/kakao': 'kakao-guide',
  '/smarcomm/dashboard/crm/email': 'email-automation',
  '/smarcomm/dashboard/crm/push': 'push-setup',
  '/smarcomm/dashboard/abtest': 'abtest-guide',
  '/smarcomm/dashboard/journey': 'journey-guide',
  '/smarcomm/dashboard/cohort': 'cohort',
  '/smarcomm/dashboard/events': 'events-guide',
  '/smarcomm/dashboard/workflow/projects': 'project-guide',
  '/smarcomm/dashboard/workflow/kanban': 'kanban-guide',
  '/smarcomm/dashboard/calendar': 'calendar-guide',
  '/smarcomm/dashboard/workflow/pipeline': 'pipeline-guide',
  '/smarcomm/dashboard/archive': 'archive-guide',
  '/smarcomm/dashboard/campaigns': 'campaigns-guide',
  '/smarcomm/dashboard/workflow/automation': 'automation-guide',
  '/smarcomm/dashboard/admin': 'admin-guide',
  '/smarcomm/dashboard/workflow': 'kanban-guide',
  '/smarcomm/dashboard/profile': 'workspace-guide',
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
