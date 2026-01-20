import { getCategories } from '@/lib/db';
import { deleteCategory } from '@/lib/actions';
import Link from 'next/link';
import styles from '../admin.module.css';
import SearchInput from '../components/SearchInput';

export const dynamic = 'force-dynamic';

export default async function CategoriesAdmin({
    searchParams,
}: {
    searchParams?: {
        q?: string;
    };
}) {
    const q = searchParams?.q?.toLowerCase() || '';
    const allCategories = await getCategories();
    const categories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q)
    );

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Categories</h1>
                <Link href="/admin/categories/new" className={styles.button}>+ Add New</Link>
            </div>
            <SearchInput placeholder="Search categories..." />
            <div className={styles.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Slug</th>
                            <th style={{ padding: '1rem' }}>Order</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{cat.name}</td>
                                <td style={{ padding: '1rem', color: '#64748b' }}>{cat.slug}</td>
                                <td style={{ padding: '1rem' }}>{cat.order}</td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <Link href={`/admin/categories/${cat.id}/edit`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                                        Update
                                    </Link>
                                    <form action={deleteCategory.bind(null, cat.id)}>
                                        <button type="submit" style={{ cursor: 'pointer', color: '#ef4444', background: 'transparent', border: 'none', fontWeight: 500 }}>Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
