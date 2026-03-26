"use client";

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            <div className="max-w-3xl mx-auto px-6">
                <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "var(--tn-text-sub)" }}>Terms of Service</p>
                <h1 className="text-3xl font-light tracking-tight mb-10">이용약관</h1>

                <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--tn-text-sub)" }}>
                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제1조 (목적)</h2>
                        <p>이 약관은 Ten:One&trade;(이하 &quot;회사&quot;)가 운영하는 웹사이트 및 관련 서비스(이하 &quot;서비스&quot;)의 이용 조건과 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제2조 (정의)</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>&quot;서비스&quot;: 회사가 제공하는 모든 온라인 서비스 (tenone.biz 및 하위 도메인)</li>
                            <li>&quot;이용자&quot;: 본 약관에 따라 서비스를 이용하는 자</li>
                            <li>&quot;회원&quot;: 가입 절차를 통해 서비스 이용 계약을 체결한 자</li>
                            <li>&quot;Universe&quot;: Ten:One&trade;가 운영하는 브랜드 생태계 전체</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제3조 (약관의 효력)</h2>
                        <p>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다. 회사는 관련 법령에 위배되지 않는 범위에서 약관을 개정할 수 있습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제4조 (회원가입)</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>이용자가 약관에 동의하고 가입 양식을 작성하여 회원가입을 신청합니다.</li>
                            <li>회사는 신청에 대해 승낙함으로써 이용 계약이 성립됩니다.</li>
                            <li>허위 정보 기재 시 서비스 이용이 제한될 수 있습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제5조 (서비스의 제공)</h2>
                        <p>회사는 다음의 서비스를 제공합니다:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>브랜드 포털 및 콘텐츠 서비스</li>
                            <li>커뮤니티 및 네트워킹 서비스</li>
                            <li>프로젝트 관리 및 협업 도구 (WIO)</li>
                            <li>마케팅·컨설팅 솔루션 (SmarComm)</li>
                            <li>인재 매칭 및 교육 (HeRo, Evolution School)</li>
                            <li>트렌드 분석 (Mindle)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제6조 (이용자의 의무)</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>타인의 개인정보를 도용하지 않습니다.</li>
                            <li>서비스를 이용하여 법령 또는 공서양속에 반하는 행위를 하지 않습니다.</li>
                            <li>서비스의 안정적 운영을 방해하는 행위를 하지 않습니다.</li>
                            <li>회사의 사전 동의 없이 서비스를 이용하여 영업 활동을 하지 않습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제7조 (지적재산권)</h2>
                        <p>서비스에 포함된 콘텐츠(텍스트, 이미지, 로고, 소프트웨어 등)에 대한 지적재산권은 회사에 귀속됩니다. 이용자는 회사의 사전 승낙 없이 이를 복제, 배포, 방송, 기타 방법으로 이용할 수 없습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제8조 (면책조항)</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>천재지변 등 불가항력으로 인한 서비스 제공 불능 시 책임이 면제됩니다.</li>
                            <li>이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임지지 않습니다.</li>
                            <li>무료로 제공되는 서비스에 대해서는 별도의 손해배상 책임을 부담하지 않습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>제9조 (분쟁 해결)</h2>
                        <p>서비스 이용과 관련한 분쟁은 대한민국 법률에 따르며, 관할 법원은 회사 소재지를 관할하는 법원으로 합니다.</p>
                    </section>

                    <p className="text-xs pt-4 border-t" style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>
                        본 약관은 2026년 3월 26일부터 시행됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
