import Link from "next/link";

const brandLinks = [
    { name: 'TenOne.biz', href: 'http://TenOne.biz' },
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
        <footer className="border-t border-zinc-800 bg-zinc-950">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-wider">
                            Ten<span className="text-indigo-500">:</span>One™
                        </h3>
                        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
                            Beyond the Limit,<br />Universe of Possibilities.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Universe</h4>
                        <ul className="space-y-2">
                            {brandLinks.map(link => (
                                <li key={link.name}>
                                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-white transition-colors">{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Navigate</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-sm text-zinc-500 hover:text-white transition-colors">About</Link></li>
                            <li><Link href="/universe" className="text-sm text-zinc-500 hover:text-white transition-colors">Universe</Link></li>
                            <li><Link href="/brands" className="text-sm text-zinc-500 hover:text-white transition-colors">Brands</Link></li>
                            <li><Link href="/history" className="text-sm text-zinc-500 hover:text-white transition-colors">History</Link></li>
                            <li><Link href="/contact" className="text-sm text-zinc-500 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li>전천일 Cheonil Jeon</li>
                            <li>Founder / Value Connector</li>
                            <li><a href="mailto:lools@tenone.biz" className="hover:text-white transition-colors">lools@tenone.biz</a></li>
                            <li><a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kakao Open Chat</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-600">&copy; 2020-2025 Ten:One™ Universe. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-zinc-600">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
