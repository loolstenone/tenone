'use client';

import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import BroadcastPage from '@/features/smarcomm/BroadcastPage';
import PushSubscribeButton from '@/features/smarcomm/PushSubscribeButton';

export default function PushPage() {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between print:hidden">
                <PushSubscribeButton />
                <PageTopBar />
            </div>
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
                sourceNote="VAPID Web Push 연동 완료. 구독자는 /api/smarcomm/push/subscribe 로 등록, 발송은 /api/smarcomm/push/send 사용. 서비스 워커: /smarcomm-sw.js"
            />
        </div>
    );
}
