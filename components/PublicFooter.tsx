import Link from "next/link";

const brandLinks = [
    { name: 'Badak.biz', href: 'http://Badak.biz' },
    { name: 'MADLeap.co.kr', href: 'http://MADLeap.co.kr' },
    { name: 'MADLeague.net', href: 'http://MADLeague.net' },
    { name: 'YouInOne.com', href: 'http://YouInOne.com' },
    { name: 'FWN.co.kr', href: 'http://FWN.co.kr' },
    { name: '0gamja.com', href: 'http://0gamja.com' },
    { name: 'RooK.co.kr', href: 'http://RooK.co.kr' },
];

export function PublicFooter() {
    return (
        <footer className="bg-neutral-900 text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-wider">
                            Ten:One™
                        </h3>
                        <p className="mt-4 text-sm text-neutral-500 leading-relaxed">
                            Beyond the Limit,<br />
                            Universe of Possibilities.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-[0.2em] mb-6">Universe</h4>
                        <ul className="space-y-3">
                            {brandLinks.map(link => (
                                <li key={link.name}>
                                    <a href={link.href} target="_blank" rel="noopener noreferrer"
                                        className="text-sm text-neutral-500 hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-[0.2em] mb-6">Navigate</h4>
                        <ul className="space-y-3">
                            <li><Link href="/works" className="text-sm text-neutral-500 hover:text-white transition-colors">Works</Link></li>
                            <li><Link href="/about" className="text-sm text-neutral-500 hover:text-white transition-colors">About</Link></li>
                            <li><Link href="/newsroom" className="text-sm text-neutral-500 hover:text-white transition-colors">Newsroom</Link></li>
                            <li><Link href="/contact" className="text-sm text-neutral-500 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-[0.2em] mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm text-neutral-500">
                            <li className="text-white">전천일 Cheonil Jeon</li>
                            <li>Founder / Value Connector</li>
                            <li><a href="mailto:lools@tenone.biz" className="hover:text-white transition-colors">lools@tenone.biz</a></li>
                            <li><a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kakao Open Chat</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-neutral-600">&copy; 2020-{new Date().getFullYear()} Ten:One™ Universe. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-neutral-600">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
