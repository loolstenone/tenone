import { HeroForm } from './HeroForm';

export const metadata = {
  title: 'HeRo 프로그램 — 커리어 상담',
  description: 'MADLeague HeRo 커리어 솔루션 — 진로 설계부터 취업까지',
};

export default function HeroPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,192,0,0.15),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#FFC000]">HERO PROGRAM</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">
            진로 설계부터<br />취업까지
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-neutral-300 leading-relaxed">
            MADLeague의 HeRo 프로그램은 단순한 취업 상담이 아닙니다.
            <br />
            매드리거의 활동 이력이 자산이 되고, 현업 네트워크가 기회로 이어지는
            <strong className="text-white"> 커리어 솔루션</strong>입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="bg-neutral-950 border border-neutral-900 p-8 mb-8">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-2">매드리거 혜택</div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            이미 MADLeague 매드리거라면, 로그인 후 신청하시면 활동 이력이 자동 연동됩니다.
            이력서·포트폴리오를 별도로 준비하지 않아도 됩니다.
          </p>
        </div>

        <HeroForm />
      </section>
    </div>
  );
}
