"use client";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            <div className="max-w-3xl mx-auto px-6">
                <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "var(--tn-text-sub)" }}>Privacy Policy</p>
                <h1 className="text-3xl font-light tracking-tight mb-10">개인정보처리방침</h1>

                <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--tn-text-sub)" }}>
                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>1. 개인정보의 수집 및 이용 목적</h2>
                        <p>Ten:One&trade;(이하 &quot;회사&quot;)는 다음의 목적을 위해 개인정보를 수집 및 이용합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 개인 식별</li>
                            <li>서비스 제공: 콘텐츠 제공, 맞춤 서비스 제공, 프로젝트 참여</li>
                            <li>마케팅 및 광고: 뉴스레터 발송, 이벤트 안내 (동의 시)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>2. 수집하는 개인정보 항목</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>필수: 이메일, 이름(닉네임)</li>
                            <li>선택: 전화번호, 소속, 직책, 프로필 사진</li>
                            <li>자동 수집: 접속 IP, 쿠키, 서비스 이용 기록</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>3. 개인정보의 보유 및 이용 기간</h2>
                        <p>회원 탈퇴 시 지체 없이 파기합니다. 다만, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>계약 또는 청약철회에 관한 기록: 5년</li>
                            <li>대금결제 및 재화 공급에 관한 기록: 5년</li>
                            <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>4. 개인정보의 제3자 제공</h2>
                        <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 이용자의 사전 동의가 있는 경우 또는 법령에 의한 경우에 한합니다.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>5. 개인정보의 파기</h2>
                        <p>보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 파기합니다. 전자적 파일은 복원이 불가능한 방법으로 영구 삭제하며, 종이 문서는 분쇄기로 파쇄합니다.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>6. 이용자의 권리</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>개인정보 열람, 정정, 삭제, 처리정지 요구</li>
                            <li>프로필 페이지에서 직접 수정 가능</li>
                            <li>회원 탈퇴를 통한 개인정보 삭제</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>7. 개인정보 보호책임자</h2>
                        <p>성명: 전천일<br />직책: 대표<br />이메일: privacy@tenone.biz</p>
                    </section>

                    <p className="text-xs pt-4 border-t" style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>
                        본 방침은 2026년 3월 26일부터 시행됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
