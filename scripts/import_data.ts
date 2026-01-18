import fs from 'fs/promises';
import path from 'path';

// --- Types based on your DB ---
type Category = {
    id: number;
    name: string;
    slug: string;
};

type Question = {
    id: number;
    categoryId: number;
    title: string;
    slug: string;
    answer: string;
    displayOrder: number;
    useCases?: string;
    realTimeUseCases?: string;
};

type DB = {
    categories: Category[];
    questions: Question[];
};

// --- Types based on Source Data ---
// Key is Category Name (e.g., "HTML")
// Value is Array of SourceQuestion
type SourceQuestion = {
    id: number;
    name: string; // Seems redundant, logic uses 'question' as title
    question: string; // "**Title**"
    answer: string;
    useCases: string[];
    realTimeUseCases: string[];
};

type SourceData = Record<string, SourceQuestion[]>;

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const SOURCE_PATH = path.join(process.cwd(), 'data', 'source_questions.json');

async function importData() {
    console.log('🚀 Starting Data Import...');

    // 1. Load Files
    let db: DB;
    let sourceData: SourceData;

    try {
        const dbContent = await fs.readFile(DB_PATH, 'utf-8');
        db = JSON.parse(dbContent);
        console.log(`✅ Loaded DB.json (${db.categories.length} categories, ${db.questions.length} existing questions)`);
    } catch (e) {
        console.error('❌ Failed to load db.json', e);
        return;
    }

    try {
        const sourceContent = await fs.readFile(SOURCE_PATH, 'utf-8');
        sourceData = JSON.parse(sourceContent);
        console.log(`✅ Loaded source_questions.json`);
    } catch (e) {
        console.error('❌ Failed to load data/source_questions.json. Make sure the file exists!');
        return;
    }

    // 2. Backup DB
    await fs.writeFile(DB_PATH + '.bak', JSON.stringify(db, null, 2));
    console.log('💾 Backup created: db.json.bak');

    // 3. Process Data
    let newQuestionsCount = 0;
    let missingCategories: string[] = [];
    let nextId = db.questions.length > 0 ? Math.max(...db.questions.map(q => q.id)) + 1 : 1;

    // Iterate over Source Keys (Category Names)
    for (const [sourceCatName, questions] of Object.entries(sourceData)) {

        // Find matching category in our DB (Case insensitive check)
        // Adjust this logic if names don't match exactly (e.g. "ReactJS" vs "React JS")
        const category = db.categories.find(c =>
            c.name.toLowerCase() === sourceCatName.toLowerCase() ||
            c.slug === sourceCatName.toLowerCase()
        );

        if (!category) {
            missingCategories.push(sourceCatName);
            console.warn(`⚠️  Skipping Category: "${sourceCatName}" (Not found in db.json)`);
            continue;
        }

        console.log(`Processing "${sourceCatName}" -> ID: ${category.id} (${questions.length} questions)`);

        for (const srcQ of questions) {
            // Clean Title: Remove "**" and trim
            const cleanTitle = srcQ.question.replace(/\*\*/g, '').trim();

            // Generate Slug
            const slug = cleanTitle
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]/g, '')
                .replace(/-+/g, '-'); // No double dashes

            // Join Arrays to Strings
            const useCasesStr = Array.isArray(srcQ.useCases) ? srcQ.useCases.join('\n• ') : srcQ.useCases;
            const realTimeStr = Array.isArray(srcQ.realTimeUseCases) ? srcQ.realTimeUseCases.join('\n• ') : srcQ.realTimeUseCases;

            // Check if slug already exists to prevent duplicates? 
            // Optional: for now we just append.

            const newQ: Question = {
                id: nextId++,
                categoryId: category.id,
                title: cleanTitle,
                slug: slug,
                answer: srcQ.answer,
                displayOrder: db.questions.filter(q => q.categoryId === category.id).length + 1, // Append to end
                useCases: useCasesStr ? `• ${useCasesStr}` : undefined, // Add bullet point formatting
                realTimeUseCases: realTimeStr ? `• ${realTimeStr}` : undefined
            };

            db.questions.push(newQ);
            newQuestionsCount++;
        }
    }

    // 4. Save
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    console.log('\n🎉 Import Complete!');
    console.log(`Total New Questions Added: ${newQuestionsCount}`);

    if (missingCategories.length > 0) {
        console.log('\n⚠️  The following categories from source were NOT found in DB:');
        console.log(missingCategories.join(', '));
    }
}

importData();
