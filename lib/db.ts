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
    imageUrl?: string;
    codeSnippet?: string;
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
    // This allows errors to propagate so we don't accidentally assume "not found" on network error
    const { blobs } = await list({
        prefix: BLOB_FILENAME,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const dbBlob = blobs.find(b => b.pathname === BLOB_FILENAME);
    return dbBlob?.url || null;
}

async function getDBFromBlob(): Promise<DB | null> {
    const url = await getBlobUrl();
    if (!url) return null; // Blob does not exist

    // CACHE: 'no-store' is CRITICAL to ensure we always get the latest data
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to fetch DB from Blob: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

async function saveDBToBlob(db: DB): Promise<boolean> {
    try {
        await put(BLOB_FILENAME, JSON.stringify(db, null, 2), {
            access: 'public',
            addRandomSuffix: false, // Keep the same filename
            token: process.env.BLOB_READ_WRITE_TOKEN,
            // @ts-ignore
            allowOverwrite: true,
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
        try {
            const blobDB = await getDBFromBlob();
            if (blobDB) return blobDB;

            // If we are here, it means no Blob URL was found (blob doesn't exist).
            // ONLY then do we initialize from local.
            console.log('📦 Blob not found, initializing from local...');
            const localDB = await getDBFromLocal();
            await saveDBToBlob(localDB);
            return localDB;

        } catch (error) {
            console.error('🔥 Critical Error loading DB from Blob:', error);
            // FAIL SAFE: Do NOT fall back to local if there was an error (e.g. network/parse)
            // This prevents overwriting the cloud DB with local data during a glitch.
            // But we must return *something* or the app crashes. 
            // Better to crash than to lose data? 
            // For now, let's rethrow to alert the issue rather than silently returning empty/stale data.
            throw error;
        }
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
