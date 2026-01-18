import Link from 'next/link';
import AdminLogout from '@/components/AdminLogout';
import styles from './admin.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <Link href="/admin" className={styles.brand}>
                    Admin Panel
                </Link>
                <nav className={styles.nav}>
                    <a href="/admin" className={styles.navLink}>Dashboard</a>
                    <a href="/admin/categories" className={styles.navLink}>Categories</a>
                    <a href="/admin/questions" className={styles.navLink}>Questions</a>
                    <a href="/" className={styles.navLink} target="_blank">View Site ↗</a>
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                        <AdminLogout />
                    </div>
                </nav>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
