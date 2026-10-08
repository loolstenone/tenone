import { ClipboardCheck, Mic, Beer, Handshake, Briefcase, Sparkles } from 'lucide-react';
import { MAD_PROGRAM_IMAGES } from '@/lib/madleague-program-assets';
import { ProgramDetailPage, ProgramSection } from '@/features/madleague/ProgramDetailPage';
import { getMadProgram } from '@/features/madleague/programs-list';

export const revalidate = 300;

const program = getMadProgram('dam');
export const metadata = { title: program.title, description: program.desc };

// 원본: madleague.net/DAMParty · /DAMHistory (2026-10-07 이전)
// 원본의 개인 입금 계좌·개인 연락처·개인 이메일은 옮기지 않는다 — 회차별 안내는 신청서 설명에, 문의는 문의하기 페이지로

const STEPS = [
  { icon: ClipboardCheck, title: '신청 · 참가 확정',        desc: '학생·현업·기업 각각 신청. 내부 검토 후 확정된 분께 참가비·장소를 개별 안내한다.' },
  { icon: Mic,            title: '1부 D.P.W — 포트폴리오 월', desc: '학생은 임팩트 있는 3분 자기소개(희망자), 기업은 채용 담당자의 8분 기업 소개.' },
  { icon: Beer,           title: '2부 T.A.M — 네트워킹',     desc: '맥주 한잔 들고 자유롭게. 인재 발굴을 넘어 사이드 프로젝트까지 모색한다.' },
];

const GETS = [
  { icon: Handshake, title: '직접 연결',        desc: '이력서와 기업 홈페이지로는 찾을 수 없는 좋은 인재와 좋은 기업이 얼굴을 보고 만난다.' },
  { icon: Briefcase, title: '채용 · 사이드 프로젝트', desc: '명함을 건네며 "같이 일해 보지 않을래요?" — 채용과 협업 기회가 여기서 시작된다.' },
  { icon: Sparkles,  title: '약한 연결고리',     desc: '약한 연결고리가 만드는 강력한 기회. 그 사람들이 모이는 곳이 DAM이다.' },
];

export default function DamPage() {
  return (
    <ProgramDetailPage
      programKey="dam"
      steps={STEPS}
      stepsTitle="파티는 이렇게 진행된다"
      gets={GETS}
    >
      <ProgramSection eyebrow="GUIDE" title="참가 안내">
        <ul className="space-y-3 text-lg text-neutral-300 max-w-3xl leading-relaxed">
          <li>— 신청 후 내부 검토를 통해 참가 확정되신 분께 개별로 안내드립니다. (참가비·입금 안내 포함)</li>
          <li>— 학생 행사인 관계로 세금 계산서 발행은 불가합니다.</li>
          <li>— 맥주와 다과류가 준비됩니다.</li>
          <li>— 3분 스피치는 필수가 아니며, 희망자에 한해 자기PR할 수 있는 기회로 참여를 권장합니다.</li>
        </ul>
        <p className="mt-10 text-sm text-neutral-500">주최 MAD League · 주관 유인원 · 후원 Badak</p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-2">
          {MAD_PROGRAM_IMAGES.damGallery.map(src => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="DAM 파티 시즌 3" loading="lazy" className="aspect-[4/3] w-full object-cover bg-neutral-950" />
          ))}
        </div>
      </ProgramSection>

      {/* 히스토리 (원본 /DAMHistory) */}
      <ProgramSection
        id="history"
        eyebrow="HISTORY"
        title={<>사람도, 기업도, 매칭 서비스도<br />그렇게 많은데 왜 그렇게 만나는 게 힘들까?</>}
        tone="dark"
      >
        <div className="max-w-4xl space-y-6 text-lg text-neutral-300 leading-relaxed">
          <p>DAM 파티의 처음 아이디어는 프로 구단의 신인 선수 지명전(Draft)이었습니다.</p>
          <p>취업을 열심히 준비한 대학생들이 막상 취업을 하고자 하면 어떤 회사를 선택해야 할지 알 수가 없다는 것입니다. 기업도 마찬가지입니다. 채용 공고를 내도 사람들의 지원이 없습니다. 특히 소규모의 회사는 더욱 심각합니다.</p>
          <p className="text-xl font-black text-white">가장 중요한 것이 빠졌다는 생각이 들었습니다.</p>
          <p>사람도, 기업도, 매칭 서비스도 많고 정보도 많지만 서로를 잘 알지 못한다는 것이었습니다. 미식축구나 농구 등 프로구단에서는 될성 싶은 신인 선수를 학생 시절부터 관찰하고 체크를 합니다. 앞으로 기업은 그 노력을 더 많이 해야 한다는 것입니다.</p>
          <p className="text-xl font-black text-white">같이 일해 보지 않을래요?</p>
          <p>서로의 살아온 길과 하고 싶은 이야기를 듣습니다. 맥주나 음료를 들고 자유롭게 서로에 대해 묻고 답하면서 서로를 더 깊이 알아 갑니다. 대학생, 취준생은 자신의 역량을 어필하고 선배, 기업은 손을 내밀어 함께 일하자고 명함을 내미는 파티 — 바로 DAM 네트워킹 파티입니다.</p>
          <p>이력서만으로는 서로를 알기에 부족합니다. 서로의 진실한 역량과 모습을 보여주는 DAM Party. 대학생, 취준생 여러분 그리고 현업 선배, 기업 여러분 많은 관심과 응원 부탁드립니다.</p>
        </div>
        <div className="mt-16 text-xs font-bold tracking-widest text-neutral-500 mb-4">시즌 2 스케치</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MAD_PROGRAM_IMAGES.damHistory.map(src => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="DAM 파티 시즌 2" loading="lazy" className="aspect-[4/3] w-full object-cover bg-black" />
          ))}
        </div>
      </ProgramSection>
    </ProgramDetailPage>
  );
}
