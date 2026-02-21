const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'data', 'source_questions.json');
const dbPath = path.join(__dirname, '..', 'data', 'db.json');

try {
    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Flatten source questions with category info
    let sourceQuestions = [];
    Object.keys(sourceData).forEach(categoryName => {
        if (Array.isArray(sourceData[categoryName])) {
            sourceData[categoryName].forEach(q => {
                sourceQuestions.push({
                    category: categoryName,
                    title: q.title || q.question // source uses 'question' sometimes? Let's check.
                });
            });
        }
    });

    const dbQuestions = dbData.questions;
    const dbCategories = dbData.categories;
    const dbCategoryMap = new Map(dbCategories.map(c => [c.id, c.name]));

    const dbQuestionsWithCat = dbQuestions.map(q => ({
        category: dbCategoryMap.get(q.categoryId),
        title: q.title
    }));

    console.log(`Source Questions Count: ${sourceQuestions.length}`);
    console.log(`DB Questions Count: ${dbQuestions.length}`);

    // Create unique signatures for comparison: "Category: Title"
    // Normalize titles (trim, lowercase, remove markdown) to avoid minor mismatches
    const normalize = (str) => (str || '')
        .replace(/[\*_`]/g, '') // Remove markdown chars
        .trim()
        .toLowerCase();

    // Also remove questions marks at the end? Some might have it, some not. 
    // Let's stick to markdown removal first.
    const headers = (cat, title) => `${normalize(cat)}: ${normalize(title)}`;

    const sourceSet = new Set(sourceQuestions.map(q => headers(q.category, q.title)));

    // DB might have different Category names? Let's check if they match.
    // Source: "React JS", DB: "React JS" (based on file view previously)
    // There might be slight differences, e.g. "React JS" vs "ReactJS"

    const dbSet = new Set(dbQuestionsWithCat.map(q => headers(q.category, q.title)));

    const missingInDb = [...sourceSet].filter(x => !dbSet.has(x));
    const extraInDb = [...dbSet].filter(x => !sourceSet.has(x));

    if (missingInDb.length === 0 && extraInDb.length === 0) {
        console.log('SUCCESS: All questions match by (Category, Title).');
    } else {
        console.log('WARNING: Mismatches found.');

        if (missingInDb.length > 0) {
            console.log(`Missing in DB (${missingInDb.length}):`);
            missingInDb.slice(0, 10).forEach(x => console.log(`  - ${x}`));
            if (missingInDb.length > 10) console.log('  ...');
        }

        if (extraInDb.length > 0) {
            console.log(`Extra in DB (${extraInDb.length}):`);
            extraInDb.slice(0, 10).forEach(x => console.log(`  - ${x}`));
            if (extraInDb.length > 10) console.log('  ...');
        }
    }

} catch (err) {
    console.error('Error reading files:', err);
}
