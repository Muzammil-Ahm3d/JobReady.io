import { createCategory } from '@/lib/actions';
import styles from '../../admin.module.css';

export default function NewCategory() {
    return (
        <div style={{ maxWidth: '600px' }}>
            <h1 className={styles.pageTitle} style={{ marginBottom: '2rem' }}>New Category</h1>
            <form action={createCategory} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                    <input name="name" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                    <textarea name="description" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <button type="submit" className={styles.button} style={{ alignSelf: 'flex-start' }}>Create Category</button>
            </form>
        </div>
    )
}
