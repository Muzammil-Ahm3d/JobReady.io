import fs from 'fs/promises';
import path from 'path';
import { put, head, list } from '@vercel/blob';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const BLOB_FILENAME = 'db.json';

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

// Check if we're on Vercel (has BLOB token)
function isVercelBlobEnabled(): boolean {
    return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// --- Vercel Blob Helpers ---
async function getBlobUrl(): Promise<string | null> {
    try {
        const { blobs } = await list({ prefix: BLOB_FILENAME });
        const dbBlob = blobs.find(b => b.pathname === BLOB_FILENAME);
        return dbBlob?.url || null;
    } catch (e) {
        console.warn('⚠️ Could not list blobs:', e);
        return null;
    }
}

async function getDBFromBlob(): Promise<DB | null> {
    try {
        const url = await getBlobUrl();
        if (!url) return null;

        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        console.warn('⚠️ Could not read from blob:', e);
        return null;
    }
}

async function saveDBToBlob(db: DB): Promise<boolean> {
    try {
        await put(BLOB_FILENAME, JSON.stringify(db, null, 2), {
            access: 'public',
            addRandomSuffix: false, // Keep the same filename
        });
        return true;
    } catch (e) {
        console.warn('⚠️ Could not save to blob:', e);
        return false;
    }
}

// --- Local File Helpers ---
async function ensureLocalDB() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify({ categories: [], questions: [] }, null, 2));
    }
}

async function getDBFromLocal(): Promise<DB> {
    await ensureLocalDB();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function saveDBToLocal(db: DB): Promise<boolean> {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
        return true;
    } catch (e) {
        console.warn('⚠️ Could not save to local file:', e);
        return false;
    }
}

// --- Public API (auto-selects storage based on environment) ---

export async function getDB(): Promise<DB> {
    if (isVercelBlobEnabled()) {
        const blobDB = await getDBFromBlob();
        if (blobDB) return blobDB;
        // Fallback: Initialize blob from local file if blob is empty
        console.log('📦 Blob empty, initializing from local...');
        const localDB = await getDBFromLocal();
        await saveDBToBlob(localDB);
        return localDB;
    }
    return getDBFromLocal();
}

export async function saveDB(db: DB): Promise<boolean> {
    if (isVercelBlobEnabled()) {
        return saveDBToBlob(db);
    }
    return saveDBToLocal(db);
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
