import { FileText, Dumbbell, Briefcase, Pencil, FolderOpen, Users } from 'lucide-react';
import { ProgramDetailPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

export const revalidate = 300;

// 실전 훈련 프로그램 — RooK(크리에이티브) 연계. 참가 신청서는 인트라 › 참가 신청에서 프로그램 키 rookie로 만들면 CTA에 자동으로 붙는다
const program = getMadProgram('rookie');
export const metadata = { title: program.title, description: program.desc };

const STEPS = [
  { icon: FileText, title: '기수 모집 · 신청',     desc: '모집이 열리면 신청서를 작성한다. 매드리거는 모집 소식을 가장 먼저 받는다.' },
  { icon: Dumbbell, title: '실전 크리에이티브 훈련', desc: '현업 크리에이터와 함께 아이디어·카피·비주얼을 실전 기준으로 훈련한다.' },
  { icon: Briefcase, title: '실전 프로젝트 참여',   desc: '훈련한 역량으로 RooK 실전 프로젝트에 참여할 기회가 주어진다.' },
];

const GETS = [
  { icon: Pencil,     title: '실전 크리에이티브 역량', desc: '과제가 아니라 실전 기준으로 다듬어진 크리에이티브.' },
  { icon: FolderOpen, title: '실전 프로젝트 결과물',   desc: '훈련으로 끝나지 않고 실제 프로젝트 결과물이 포트폴리오에 남는다.' },
  { icon: Users,      title: '현업 네트워크',         desc: 'RooK 크리에이터·선배들과 같은 프로젝트에서 일한 인연.' },
];

export default function RooKiePage() {
  return <ProgramDetailPage programKey="rookie" steps={STEPS} stepsTitle="훈련에서 실전까지" gets={GETS} />;
}
