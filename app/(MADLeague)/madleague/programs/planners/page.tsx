import { FileText, Dumbbell, Briefcase, Target, FolderOpen, Users } from 'lucide-react';
import { ProgramDetailPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

export const revalidate = 300;

// 실전 훈련 프로그램 — 전략 기획. 참가 신청서는 인트라 › 참가 신청에서 프로그램 키 planners로 만들면 CTA에 자동으로 붙는다
const program = getMadProgram('planners');
export const metadata = { title: program.title, description: program.desc };

const STEPS = [
  { icon: FileText, title: '기수 모집 · 신청',   desc: '모집이 열리면 신청서를 작성한다. 매드리거는 모집 소식을 가장 먼저 받는다.' },
  { icon: Dumbbell, title: '실전 전략 기획 훈련', desc: '시장 분석·문제 정의·전략 수립·제안서 작성을 실전 기준으로 훈련한다.' },
  { icon: Briefcase, title: '실전 프로젝트 참여', desc: '훈련한 역량으로 실전 프로젝트에 참여할 기회가 주어진다.' },
];

const GETS = [
  { icon: Target,     title: '실전 전략 기획 역량', desc: '과제가 아니라 실전 기준으로 다듬어진 기획력.' },
  { icon: FolderOpen, title: '실전 프로젝트 결과물', desc: '훈련으로 끝나지 않고 실제 제안서·프로젝트가 포트폴리오에 남는다.' },
  { icon: Users,      title: '현업 네트워크',       desc: '기획자 선배들과 같은 프로젝트에서 일한 인연.' },
];

export default function PlannersPage() {
  return <ProgramDetailPage programKey="planners" steps={STEPS} stepsTitle="훈련에서 실전까지" gets={GETS} />;
}
