'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import styles from './Header.module.css';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');

    // Debounced live search — navigates after 400ms of no typing
    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length === 0) return;
        if (trimmed.length < 2) return; // Don't search for single chars

        const timer = setTimeout(() => {
            router.push(`/?q=${encodeURIComponent(trimmed)}`);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, router]);

    // Also handle form submit for Enter key (instant, no debounce)
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        router.push(`/?q=${encodeURIComponent(trimmed)}`);
    };

    const handleClear = () => {
        setQuery('');
        router.push('/');
    };

    return (
        <div className={styles.searchWrapper}>
            <form onSubmit={handleSearch} className={styles.searchBox}>
                <Search className={styles.searchIcon} />
                <input
                    name="q"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search globally..."
                    className={styles.searchInput}
                    autoComplete="off"
                />
            </form>
        </div>
    );
}
