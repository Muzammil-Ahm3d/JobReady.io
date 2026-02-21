import { Suspense } from 'react';
import { getCategories } from '@/lib/db';
import styles from './Header.module.css';
import HeaderContent from './HeaderContent';

export default async function Header() {
    const categories = await getCategories();

    return (
        <header className={styles.header}>
            <Suspense fallback={<div className={styles.container} />}>
                <HeaderContent categories={categories} />
            </Suspense>
        </header>
    );
}
