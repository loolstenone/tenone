import { ProfileInvite } from '@/components/profile/ProfileInvite';

/** 없는 핸들·잘못된 프로필 주소 — 막힌 화면 대신 내 프로필 만들기로 안내 */
export default function ProfileNotFound() {
    return <ProfileInvite variant="notfound" />;
}
