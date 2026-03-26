'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SmarCommSignupRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/signup');
    }, [router]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
    );
}
