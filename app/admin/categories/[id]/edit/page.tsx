import { getCategories } from '@/lib/db';
import { updateCategory } from '@/lib/actions';
import styles from '../../../admin.module.css';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const categories = await getCategories();
    const category = categories.find(c => c.id === parseInt(id));

    if (!category) {
        redirect('/admin/categories');
    }

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 className={styles.pageTitle} style={{ marginBottom: '2rem' }}>Edit Category</h1>
            <form action={updateCategory.bind(null, category.id)} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                    <input name="name" type="text" defaultValue={category.name} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description (Optional)</label>
                    <textarea name="description" rows={3} defaultValue={category.description} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <button type="submit" className={styles.button} style={{ alignSelf: 'flex-start' }}>Update Category</button>
            </form>
        </div>
    )
}
