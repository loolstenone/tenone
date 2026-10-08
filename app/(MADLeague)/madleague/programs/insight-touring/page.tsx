import { MapPin, Eye, Lightbulb, Presentation, Compass, FileText, FolderOpen } from 'lucide-react';
import { ProgramDetailPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

const program = getMadProgram('insight-touring');
export const metadata = { title: program.title, description: program.desc };

const STEPS = [
  { icon: MapPin,       title: '지역 투어',      desc: '지역 산업·문화·거점을 현장에서 직접 탐구한다.' },
  { icon: Eye,          title: '관찰 · 인터뷰',  desc: '대표·실무자 인터뷰, 소비자 관찰, 경쟁사 답사.' },
  { icon: Lightbulb,    title: '혁신 제안',      desc: '학생의 시선으로 재해석한 전략 제안서를 쓴다.' },
  { icon: Presentation, title: '현장 발표',      desc: '지역·기업 앞에서 제안을 발표하고 피드백을 받는다.' },
];

const GETS = [
  { icon: Compass,    title: '현장 인사이트',  desc: '책상이 아니라 현장에서 얻은 통찰. 당신의 통찰이 지역을 바꾼다.' },
  { icon: FileText,   title: '전략 제안서',   desc: '지역·기업에 실제로 전달되는 제안서 한 편.' },
  { icon: FolderOpen, title: '포트폴리오',    desc: '투어부터 발표까지 한 사이클이 포트폴리오로 남는다.' },
];

export default function InsightTouringPage() {
  return (
    <ProgramDetailPage
      programKey="insight-touring"
      steps={STEPS}
      stepsTitle="투어에서 제안까지"
      gets={GETS}
    />
  );
}
