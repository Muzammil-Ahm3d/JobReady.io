import Link from 'next/link';
import SearchBar from './SearchBar';
import styles from './Header.module.css';
import { getCategories } from '@/lib/db';

export default async function Header() {
    const categories = await getCategories();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>JobReady.io</span>
                </Link>
                <nav className={styles.nav}>
                    {categories.map(cat => (
                        <Link key={cat.id} href={`/${cat.slug}`} className={styles.navLink}>{cat.name}</Link>
                    ))}
                </nav>
                <SearchBar />
            </div>
        </header>
    );
}
