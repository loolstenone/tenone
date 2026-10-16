import { ProfileInvite } from '@/components/profile/ProfileInvite';
import { BRAND_PROFILES } from '@/lib/profile/brand-profiles';

/** 없는 핸들 — MAD League 안에서 가입·내 프로필 만들기로 안내 (tenone.biz로 보내지 않는다) */
export default function MadProfileNotFound() {
    return (
        <div className="min-h-screen bg-black text-white">
            <ProfileInvite variant="notfound" brand={BRAND_PROFILES.madleague} />
        </div>
    );
}
