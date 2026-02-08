const fs = require('fs');
const path = require('path');

// Use relative path from CWD (which is project root)
const filePath = path.join(process.cwd(), 'data', 'db.json');

console.log('Processing file:', filePath);

try {
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const db = JSON.parse(data);

    let modifications = 0;

    // db.json structure is { categories: [], questions: [] }
    if (Array.isArray(db.questions)) {
        db.questions.forEach(q => {
            if (q.answer && typeof q.answer === 'string') {
                let newAnswer = q.answer;
                const originalAnswer = q.answer;

                // Debug specific question
                if (q.id === 6) {
                    console.log('Original Q6:', JSON.stringify(q.answer));
                }

                // 1. Headers Normalization (Aggressive regex to catch "•Main issue here is")
                // We use replace with capture groups to handle potential leading bullets

                // "Main issue"
                newAnswer = newAnswer.replace(/(?:•\s*)?(?:Main issue here is|Main issue)(?:\s*[:—-])?/gi, '\n\n**Main Issue:**');

                // "Why"
                newAnswer = newAnswer.replace(/(?:•\s*)?(?:Why that issue came means|Why it happened|Why)(?:\s*[:—-])?/gi, '\n\n**Why:**');

                // "How found"
                newAnswer = newAnswer.replace(/(?:•\s*)?(?:How I found issue means|How found)(?:\s*[:—-])?/gi, '\n\n**How Found:**');

                // "Fix"
                newAnswer = newAnswer.replace(/(?:•\s*)?(?:I could Fixed this issue\s*[-—]?\s*steps|Fix\s*[-—]?\s*steps|Fix)(?:\s*[:—.\-])?/gi, '\n\n**Fix Steps:**');

                // "Benefits"
                newAnswer = newAnswer.replace(/(?:•\s*)?Benefits(?:\s*[:—-])?/gi, '\n\n**Benefits:**');

                // 2. Hand Gestures -> Steps (Numbered list)
                const handMap = {
                    '☝️': '1', '✌️': '2', '🤟': '3', '✋': '4', '👌': '5',
                    '🫱': '6', '🫲': '7', '🫳': '8', '🫴': '9', '👏': '10', '🙌': '11'
                };
                Object.keys(handMap).forEach(emoji => {
                    // Use simpler replacement without regex to avoid issues
                    while (newAnswer.includes(emoji)) {
                        newAnswer = newAnswer.replace(emoji, `\n\n### ${handMap[emoji]}. `);
                    }
                });

                // 3. Checkmarks -> List Items
                newAnswer = newAnswer.replace(/☑️/g, '\n- ');

                // 4. Remaining Bullets -> List Items
                // This catches "• Challenge 1" and makes it a list item
                newAnswer = newAnswer.replace(/•/g, '\n- ');

                // 5. Cleanup
                newAnswer = newAnswer.replace(/:\s*:/g, ':');
                // Ensure space after bullets
                newAnswer = newAnswer.replace(/\n-\s*([^\s])/g, '\n- $1');
                // Max 2 newlines
                newAnswer = newAnswer.replace(/\n{3,}/g, '\n\n');

                if (newAnswer !== originalAnswer) {
                    q.answer = newAnswer;
                    modifications++;
                    if (q.id === 6) {
                        console.log('Modified Q6:', JSON.stringify(newAnswer));
                    }
                }
            }
        });
    }

    fs.writeFileSync(filePath, JSON.stringify(db, null, 4), 'utf8');
    console.log(`Success! Refined locally ${modifications} answers in db.json.`);

} catch (err) {
    console.error('Error processing file:', err);
}
