'use client';

import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import BroadcastPage from '@/features/smarcomm/BroadcastPage';

export default function KakaoPage() {
    return (
        <div>
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
            <div className="mb-2 flex items-center gap-2"><GuideHelpButton /></div>
            <BroadcastPage
                channelPrefix="kakao"
                channelOptions={[
                    { value: 'kakao_alimtalk', label: '알림톡 (정보성)' },
                    { value: 'kakao_friendtalk', label: '친구톡 (마케팅)' },
                    { value: 'kakao_bizmsg', label: '비즈메시지' },
                ]}
                defaultChannel="kakao_alimtalk"
                title="카카오 메시지"
                description="알림톡·친구톡·비즈메시지 발송을 통합 관리합니다"
                accentColor="#FEE500"
                sourceNote="카카오 비즈메시지 API 연동 시 sent/delivered/opened 자동 갱신. 알림톡은 사전 승인된 템플릿 코드 필요(Phase C)."
            />
        </div>
    );
}
