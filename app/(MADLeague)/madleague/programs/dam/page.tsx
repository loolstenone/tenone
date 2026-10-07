import { MAD_PROGRAM_IMAGES } from '@/lib/madleague-program-assets';
import { ProgramForms } from '@/features/madleague/ProgramForms';

export const revalidate = 300;

export const metadata = {
  title: '댐 파티',
  description: 'DAM(Draft Assembly Meeting) — 약한 연결고리가 만드는 강력한 기회. 대학생·현업·기업이 직접 만나는 네트워킹 파티.',
};

// 원본: madleague.net/DAMParty · /DAMHistory (2026-10-07 이전)
// 원본의 개인 입금 계좌·개인 연락처는 옮기지 않는다 — 회차별 안내는 신청서 설명에 적는다

export default function DamPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Hero — 원본 키비주얼 */}
      <section className="border-b border-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MAD_PROGRAM_IMAGES.damHero} alt="DAM Party — 약한 연결고리가 만드는 강력한 기회" className="block w-full" />
      </section>

      <section className="mx-auto max-w-5xl px-6 py-28">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25]">DAM NETWORKING PARTY</div>
        <h1 className="mt-4 text-4xl sm:text-6xl font-black leading-tight">우리와 맞는 좋은 인재,<br />나와 맞는 좋은 기업</h1>
        <p className="mt-6 text-2xl text-neutral-400 font-bold">찾기 힘드셨죠?</p>
        <p className="mt-10 text-xl text-neutral-300 leading-relaxed">
          약한 연결고리가 만드는 강력한 기회. 강력한 기회를 만드는 사람들이 모이는 곳, DAM으로 당신을 초대합니다.
        </p>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          대학생 마케팅 프로젝트 연합 MAD League에서 광고&amp;마케팅 업계 취업 준비생과 대학생, 기업의 인사 담당자들이 직접 만나
          새로운 채용과 취업 기회를 창출하고자 합니다. 이력서와 기업 홈페이지로 찾아낼 수 없는 좋은 인재와 좋은 기업의 연결고리 —
          그 약한 연결고리가 만드는 강력한 기회, DAM(Draft Assembly Meeting)을 개최합니다.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-neutral-950 border border-neutral-900 p-10">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">#1부</div>
          <div className="mt-3 text-2xl font-black">D.P.W (DAM Portfolio Wall)</div>
          <ul className="mt-6 space-y-3 text-neutral-400 leading-relaxed">
            <li>— 학생 포트폴리오 소개 세션: 임팩트 있고 주체적인 3분 학생 소개</li>
            <li>— 기업 포트폴리오 소개 세션: 기업 채용 담당자의 8분 기업 소개</li>
          </ul>
        </div>
        <div className="bg-neutral-950 border border-neutral-900 p-10">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">#2부</div>
          <div className="mt-3 text-2xl font-black">T.A.M (Talk About Myself)</div>
          <ul className="mt-6 space-y-3 text-neutral-400 leading-relaxed">
            <li>— 맥주 한잔 들고 자유롭게 진행되는 네트워킹</li>
            <li>— 인재 발굴을 넘어 사이드 프로젝트의 기회를 모색</li>
          </ul>
        </div>
      </section>

      <section className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="text-xs font-bold tracking-widest text-neutral-500 mb-4">GUIDE</div>
          <h2 className="text-4xl font-black mb-10">참가 안내</h2>
          <ul className="space-y-3 text-lg text-neutral-300 max-w-3xl leading-relaxed">
            <li>— 신청 후 내부 검토를 통해 참가 확정되신 분께 개별로 안내드립니다. (참가비·입금 안내 포함)</li>
            <li>— 학생 행사인 관계로 세금 계산서 발행은 불가합니다.</li>
            <li>— 맥주와 다과류가 준비됩니다.</li>
            <li>— 3분 스피치는 필수가 아니며, 희망자에 한해 자기PR할 수 있는 기회로 참여를 권장합니다.</li>
          </ul>
          <p className="mt-10 text-sm text-neutral-500">주최 MAD League · 주관 유인원 · 후원 Badak · 문의 dam.youinone@gmail.com</p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-2">
            {MAD_PROGRAM_IMAGES.damGallery.map(src => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="DAM 파티 시즌 3" loading="lazy" className="aspect-[4/3] w-full object-cover bg-neutral-950" />
            ))}
          </div>
        </div>
      </section>

      {/* 히스토리 (원본 /DAMHistory) */}
      <section id="history" className="border-t border-neutral-900 bg-neutral-950">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">HISTORY</div>
          <h2 className="text-3xl sm:text-5xl font-black leading-tight">사람도, 기업도, 매칭 서비스도<br />그렇게 많은데 왜 그렇게 만나는 게 힘들까?</h2>
          <div className="mt-12 space-y-6 text-lg text-neutral-300 leading-relaxed">
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
        </div>
      </section>

      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-sm font-bold tracking-widest text-white/70 mb-3">NEXT DAM</div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-8">참가 신청 — 학생 · 현업 · 기업</div>
          <ProgramForms program="dam" fallback={<p className="text-lg text-white/85">다음 DAM 일정은 공지 예정입니다. 문의: dam.youinone@gmail.com</p>} />
        </div>
      </section>
    </div>
  );
}
