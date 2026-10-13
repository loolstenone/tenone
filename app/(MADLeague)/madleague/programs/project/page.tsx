import { Briefcase, Users, Target, PackageCheck, MessageSquare, FolderOpen } from 'lucide-react';
import { ProgramDetailPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

const program = getMadProgram('project');
export const metadata = { title: `${program.title} — Project Job Training`, description: program.desc };

const STEPS = [
  { icon: Briefcase,   title: '기업 과제 접수',  desc: '기업이 실제로 필요로 하는 마케팅 과제를 가져온다. 기업 참여는 문의하기로.' },
  { icon: Users,       title: '크로스 팀 구성',  desc: '동아리·권역을 넘어 다양한 배경의 매드리거로 팀을 꾸린다.' },
  { icon: Target,      title: '현장 수행 — OJT', desc: '기업 담당자와 함께 과제를 수행한다. 현장에서 배우고, 현장에서 성장한다.' },
  { icon: PackageCheck, title: '결과 납품 · 피드백', desc: '과제를 완수하고 결과를 납품한다. 기업 피드백이 성장 지표.' },
];

const GETS = [
  { icon: Briefcase,     title: '실무 경험',   desc: '과제가 아니라 기업이 실제로 쓰는 결과물을 만든 경험.' },
  { icon: MessageSquare, title: '기업 피드백', desc: '현업 담당자의 피드백이 다음 성장의 기준이 된다.' },
  { icon: FolderOpen,    title: '포트폴리오',  desc: '납품한 결과물과 기업명이 포트폴리오에 남는다.' },
];

export default function ProjectPage() {
  return (
    <ProgramDetailPage
      programKey="project"
      steps={STEPS}
      stepsTitle="과제에서 납품까지"
      gets={GETS}
    />
  );
}
