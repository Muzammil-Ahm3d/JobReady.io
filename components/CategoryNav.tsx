'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Header.module.css';

type Category = {
    id: number;
    name: string;
    slug: string;
    order: number;
    description?: string;
};

export default function CategoryNav({ categories }: { categories: Category[] }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={styles.navWrapper}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.toggleButton}
                aria-label={isOpen ? "Hide categories" : "Show categories"}
            >
                {isOpen ? (
                    <>
                        <span>Hide Categories</span>
                        <ChevronUp size={16} />
                    </>
                ) : (
                    <>
                        <span>Show Categories</span>
                        <ChevronDown size={16} />
                    </>
                )}
            </button>

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
