import { PracticeProgramPage } from '@/features/madleague/PracticeProgramPage';

export const revalidate = 300;
export const metadata = { title: "Planner's", description: '실전 전략 기획을 훈련하고 실전 프로젝트에도 참여할 기회' };

export default function PlannersPage() {
  return (
    <PracticeProgramPage
      programKey="planners"
      eyebrow="PLANNER'S"
      title="Planner's"
      field="전략 기획"
      summary="실전 전략 기획을 훈련하고 실전 프로젝트에도 참여할 기회"
      accent="#2DD4BF"
    />
  );
}
