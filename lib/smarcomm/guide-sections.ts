// 자동 생성 — scripts/parse-guide-md.js에서 생성
// 원본: docs/USER_GUIDE_FULL.md

import type { GuideSection } from './guide-data';
import { GUIDE_SECTIONS_TRAFFIC } from './guide-sections-traffic';
import { GUIDE_SECTIONS_ANALYTICS } from './guide-sections-analytics';
import { GUIDE_SECTIONS_GEO } from './guide-sections-geo';
import { GUIDE_SECTIONS_CONTENT } from './guide-sections-content';
import { GUIDE_SECTIONS_WORKSPACE } from './guide-sections-workspace';
import { GUIDE_SECTIONS_PROJECT } from './guide-sections-project';

export const GUIDE_SECTIONS: Record<string, GuideSection[]> = {
  ...GUIDE_SECTIONS_TRAFFIC,
  ...GUIDE_SECTIONS_ANALYTICS,
  ...GUIDE_SECTIONS_GEO,
  ...GUIDE_SECTIONS_CONTENT,
  ...GUIDE_SECTIONS_WORKSPACE,
  ...GUIDE_SECTIONS_PROJECT,
};
