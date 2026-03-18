"use client";

const principles = [
    { num: 1, title: "우리는 모두 기획자다", sub: "적어도 자기 인생에서 만큼은" },
    { num: 2, title: "기획은 문제를 해결하는 것이다", sub: "" },
    { num: 3, title: "기획자는 일이 되게 하는 사람이다", sub: "" },
    { num: 4, title: "어설픈 완벽주의는 일을 출발시키지 못한다", sub: "" },
    { num: 5, title: "리더와 팔로어는 역할이지 직급이 아니다", sub: "" },
    { num: 6, title: "문제의 본질에 집중한다", sub: "" },
    { num: 7, title: "실현되지 않으면 아이디어가 아니다", sub: "" },
    { num: 8, title: "나의 성장이 우리의 성장이다", sub: "" },
    { num: 9, title: "신뢰는 먼저 보여주는 것이다", sub: "" },
    { num: 10, title: "나의 작은 세계가 연결되어 하나의 거대한 세계관을 만든다", sub: "" },
];

const coreValues = [
    { title: "본질 (Essence)", desc: "변하지 않을 가치에 집요하게 집중한다" },
    { title: "속도 (Speed)", desc: "옳은 방향을 계속 확인하며 빠르게 전진한다" },
    { title: "이행 (Carry Out)", desc: "본질이 확인된다면 바로 실행에 옮긴다" },
];

export default function CulturePage() {
    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white">Culture</h1>
                <p className="mt-2 text-zinc-400">&ldquo;우리는 컬처를 믿고, 컬처로 일합니다.&rdquo;</p>
            </div>

            <section>
                <h2 className="text-xl font-bold text-white mb-6">Core Value</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {coreValues.map(v => (
                        <div key={v.title} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
                            <h3 className="text-lg font-bold text-indigo-400">{v.title}</h3>
                            <p className="text-sm text-zinc-400 mt-2">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-6">Principle 10</h2>
                <div className="space-y-3">
                    {principles.map(p => (
                        <div key={p.num} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 flex items-start gap-4">
                            <span className="text-2xl font-bold text-indigo-500 w-8 text-right shrink-0">{p.num}</span>
                            <div>
                                <p className="text-white font-medium">{p.title}</p>
                                {p.sub && <p className="text-sm text-zinc-500 mt-0.5">{p.sub}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
