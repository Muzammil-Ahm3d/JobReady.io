'use client';

import { useState } from 'react';
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
                    {categories.map(cat => (
                        <Link key={cat.id} href={`/${cat.slug}`} className={styles.navLink}>{cat.name}</Link>
                    ))}
                </nav>
            )}
        </div>
    );
}
