import { FileText, Users, Zap, Presentation, Clock, FolderOpen, Network } from 'lucide-react';
import { ProgramDetailPage } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

const program = getMadProgram('markethon');
export const metadata = { title: program.title, description: program.desc };

const STEPS = [
  { icon: FileText,     title: '브리프 공개',    desc: '금요일 저녁, 과제 브리프가 그 자리에서 공개된다.' },
  { icon: Users,        title: '즉석 팀 구성',   desc: '전국 동아리 매드리거가 섞여 즉석에서 팀을 꾸린다.' },
  { icon: Zap,          title: '72시간 논스톱',  desc: '실시간 멘토링을 받으며 잠도 잊고, 생각도 멈추지 않는다.' },
  { icon: Presentation, title: '최종 발표',      desc: '월요일 아침, 결과물을 발표하고 순위를 가린다.' },
];

const GETS = [
  { icon: Clock,      title: '72시간의 결과물',     desc: '한계까지 밀어붙여 만든 전략과 크리에이티브.' },
  { icon: Network,    title: '전국 매드리거 네트워크', desc: '전국 동아리가 한 공간에 모인다. 권역을 넘은 동료가 생긴다.' },
  { icon: FolderOpen, title: '포트폴리오',          desc: '브리프부터 발표까지 72시간이 통째로 포트폴리오가 된다.' },
];

export default function MarkethonPage() {
  return (
    <ProgramDetailPage
      programKey="markethon"
      heroExtra={
        <p className="mt-8 text-2xl sm:text-3xl font-black leading-snug text-[#FFC000]">
          72시간의 열정
          <span className="block mt-2 text-lg font-bold text-neutral-400">3일 동안 잠도 잊고, 생각도 멈추지 않고. 한계까지 밀어붙이는 매드리거의 시그니처 프로그램.</span>
        </p>
      }
      steps={STEPS}
      stepsTitle="금요일 저녁부터 월요일 아침까지"
      gets={GETS}
    />
  );
}
