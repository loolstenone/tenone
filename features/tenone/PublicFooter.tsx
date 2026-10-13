import { UniverseFooter } from "@/components/UniverseFooter";

export function PublicFooter() {
    return (
        <UniverseFooter
            brandName="Ten:One™"
            tagline="기획하고, 연결하고, 확장한다."
            accentColor="#fff"
            dark={true}
            linkColumns={[
                {
                    // 지금 주로 개발하는 사이트만 (2026-10-13 사용자 결정) — 집중 브랜드가 바뀌면 여기도
                    title: "Universe",
                    links: [
                        { label: "Badak", href: "/badak" },
                        { label: "MADLeague", href: "/madleague" },
                        { label: "MADLeap", href: "/madleap" },
                        { label: "HeRo", href: "/hero" },
                    ],
                },
                {
                    title: "Navigate",
                    links: [
                        { label: "Works", href: "/works" },
                        { label: "About", href: "/about" },
                        { label: "Contact", href: "/contact" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "Contact Us", href: "/contact" },
                        { label: "Kakao Open Chat", href: "https://open.kakao.com/me/tenone", external: true },
                    ],
                },
            ]}
        />
    );
}
