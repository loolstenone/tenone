'use client';

import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import BroadcastPage from '@/features/smarcomm/BroadcastPage';

export default function PushPage() {
    return (
        <div>
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
            <div className="mb-2 flex items-center gap-2"><GuideHelpButton /></div>
            <BroadcastPage
                channelPrefix="push"
                channelOptions={[
                    { value: 'push', label: '모바일 푸시' },
                    { value: 'app_inbox', label: '앱 인박스' },
                ]}
                defaultChannel="push"
                title="푸시 메시지"
                description="모바일 푸시·앱 인박스 발송을 관리합니다"
                accentColor="#3b82f6"
                sourceNote="FCM(Firebase Cloud Messaging) 연동 시 실제 발송. 디바이스 토큰 수집 + 토픽 구독 인프라 필요(Phase C)."
            />
        </div>
    );
}
