import { PracticeProgramPage } from '@/features/madleague/PracticeProgramPage';

export const revalidate = 300;
export const metadata = { title: 'RooKie', description: '실전 크리에이티브를 훈련하고 실전 프로젝트에도 참여할 기회' };

export default function RooKiePage() {
  return (
    <PracticeProgramPage
      programKey="rookie"
      eyebrow="ROOKIE"
      title="RooKie"
      field="크리에이티브"
      summary="실전 크리에이티브를 훈련하고 실전 프로젝트에도 참여할 기회"
      accent="#00d255"
    />
  );
}
