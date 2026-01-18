import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export type Category = {
    id: number;
    name: string;
    slug: string;
    order: number;
    description?: string;
};

export type Question = {
    id: number;
    categoryId: number;
    title: string;
    slug: string;
    answer: string;
    displayOrder: number;
    useCases?: string;
    realTimeUseCases?: string;
};

export type DB = {
    categories: Category[];
    questions: Question[];
};

// Ensure data dir exists
async function ensureDB() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify({ categories: [], questions: [] }, null, 2));
    }
}

export async function getDB(): Promise<DB> {
    await ensureDB();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

export async function saveDB(db: DB) {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// Helpers
export async function getCategories() {
    const db = await getDB();
    return db.categories.sort((a, b) => a.order - b.order);
}

export async function getQuestions(categorySlug?: string) {
    const db = await getDB();
    let items = db.questions;

    if (categorySlug) {
        const cat = db.categories.find(c => c.slug === categorySlug);
        if (!cat) return [];
        items = items.filter(q => q.categoryId === cat.id);
    }

    // Attach category slug for use in UI links
    return items.map(q => {
        const cat = db.categories.find(c => c.id === q.categoryId);
        return { ...q, categorySlug: cat?.slug || '' };
    });
}

// Count helper
export async function getCategoriesWithCount() {
    const db = await getDB();
    const categories = db.categories.sort((a, b) => a.order - b.order);
    return categories.map(cat => {
        const count = db.questions.filter(q => q.categoryId === cat.id).length;
        return { ...cat, count };
    });
}
