import { UniverseFooter } from "@/components/UniverseFooter";

export function PublicFooter() {
    return (
        <UniverseFooter
            brandName="Ten:One™"
            tagline="Beyond the Limit, Universe of Possibilities."
            accentColor="#fff"
            dark={true}
            hideUniverseColumn={true}
            linkColumns={[
                {
                    title: "Universe",
                    links: [
                        { label: "Badak", href: "/badak" },
                        { label: "MADLeap", href: "/madleap" },
                        { label: "MADLeague", href: "/madleague" },
                        { label: "YouInOne", href: "/youinone" },
                        { label: "FWN", href: "/fwn" },
                        { label: "0gamja", href: "/0gamja" },
                        { label: "RooK", href: "/rook" },
                    ],
                },
                {
                    title: "Navigate",
                    links: [
                        { label: "Works", href: "/works" },
                        { label: "About", href: "/about" },
                        { label: "Newsroom", href: "/newsroom" },
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
