'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogout() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontSize: '1rem',
                display: 'block',
                width: '100%'
            }}
        >
            Logout
        </button>
    );
}
