import { MadContactForm } from '@/features/madleague/MadContactForm';

export const metadata = {
  title: '문의하기',
  description: 'MAD League 기업 협업·과제 제안, 동아리 가입·운영, 대회·프로그램 문의',
};

export default function MadContactPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">CONTACT</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">문의하기</h1>
          <p className="mt-8 max-w-2xl text-lg text-neutral-300 leading-relaxed">
            기업 협업·과제 제안, 동아리 가입·운영, 대회·프로그램 등 무엇이든 남겨 주세요.
            확인 후 이메일로 회신드립니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <MadContactForm />
      </section>
    </div>
  );
}
