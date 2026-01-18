import { getDB } from '@/lib/db';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const db = await getDB();
    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
            </div>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3 className={styles.statLabel}>Total Categories</h3>
                    <p className={styles.statValue}>{db.categories.length}</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.statLabel}>Total Questions</h3>
                    <p className={styles.statValue}>{db.questions.length}</p>
                </div>
            </div>
        </div>
    )
}
