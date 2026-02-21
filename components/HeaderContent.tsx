'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';
import SearchBar from './SearchBar';

type Category = {
    id: number;
    name: string;
    slug: string;
    order: number;
    description?: string;
};

export default function HeaderContent({ categories }: { categories: Category[] }) {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            // Check if mobile view based on CSS breakpoint (768px matches the CSS)
            if (window.innerWidth <= 768) {
                setIsOpen(false);
            }
        }
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={styles.toggleButton}
                    aria-label={isOpen ? "Hide categories" : "Show categories"}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>JobReady.io</span>
                </Link>

                <div className={styles.searchContainer}>
                    <SearchBar />
                </div>
            </div>

            {isOpen && (
                <nav className={styles.nav}>
                    {categories.map(cat => {
                        const isActive = pathname === `/${cat.slug}`;
                        return (
                            <Link
                                key={cat.id}
                                href={`/${cat.slug}`}
                                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                            >
                                {cat.name}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}
