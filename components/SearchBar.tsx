'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import styles from './Header.module.css'; // Reusing styles from Header

export default function SearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Determine if we are in a category
    // Path usually /category or /category/question
    // Exclude /admin
    const segments = pathname.split('/').filter(Boolean);
    const isCategory = segments.length > 0 && segments[0] !== 'admin' && segments[0] !== 'search';
    const currentCategory = isCategory ? segments[0] : null;

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('q') as string;

        if (!query.trim()) return;

        if (currentCategory) {
            // Search within category
            router.push(`/${currentCategory}?q=${encodeURIComponent(query)}`);
        } else {
            // Global search (using Home page or dedicated search page)
            // Let's use /search page for global to keep Home clean, or just Home
            // User said "Home: search all". So /?q=...
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    };

    const placeholder = currentCategory
        ? `Search in ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}...`
        : "Search all questions...";

    return (
        <div className={styles.searchWrapper}>
            <form onSubmit={handleSearch} className={styles.searchBox}>
                <Search className={styles.searchIcon} />
                <input
                    name="q"
                    type="search"
                    defaultValue={searchParams.get('q') || ''}
                    placeholder={placeholder}
                    className={styles.searchInput}
                />
            </form>
        </div>
    );
}
