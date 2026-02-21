const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/source_questions.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);

    let modifications = 0;

    Object.keys(json).forEach(category => {
        const questions = json[category];
        if (Array.isArray(questions)) {
            questions.forEach(q => {
                if (q.answer && typeof q.answer === 'string') {
                    let newAnswer = q.answer;
                    const originalAnswer = q.answer;

                    // 1. Replace Checkmarks with Bullet Points
                    newAnswer = newAnswer.replace(/☑️/g, '\n- ');

                    // 2. Replace Bullets with Indented Bullets
                    newAnswer = newAnswer.replace(/•/g, '\n  - ');

                    // 3. Replace Hand Gestures (Sequencing) with H3 Headers
                    newAnswer = newAnswer.replace(/☝️/g, '\n\n### 1. ');
                    newAnswer = newAnswer.replace(/✌️/g, '\n\n### 2. ');
                    newAnswer = newAnswer.replace(/🤟/g, '\n\n### 3. ');
                    newAnswer = newAnswer.replace(/✋/g, '\n\n### 4. ');
                    newAnswer = newAnswer.replace(/👌/g, '\n\n### 5. ');
                    newAnswer = newAnswer.replace(/🫱/g, '\n\n### 6. ');
                    newAnswer = newAnswer.replace(/🫲/g, '\n\n### 7. ');
                    newAnswer = newAnswer.replace(/🫳/g, '\n\n### 8. ');
                    newAnswer = newAnswer.replace(/🫴/g, '\n\n### 9. ');
                    newAnswer = newAnswer.replace(/👏/g, '\n\n### 10. ');
                    newAnswer = newAnswer.replace(/🙌/g, '\n\n### 11. ');

                    // 4. Formatting Key Sections (Bold)
                    const patterns = [
                        'Main issue',
                        'Why it happened',
                        'Why that issue came means',
                        'How found',
                        'How I found issue means',
                        'Fix',
                        'I could Fixed this issue — steps',
                        'Benefits',
                        'Steps'
                    ];

                    patterns.forEach(p => {
                        // Regex: Newline or Start of String + Pattern + Optional Chars + Colon (or dash)
                        // We replace it with \n**Pattern:**
                        // Escaping special regex chars if any (not needed for this list but good practice)
                        const regex = new RegExp(`(${p})\\s*[-—:]`, 'gi');
                        newAnswer = newAnswer.replace(regex, (match) => `\n\n**${match.replace(/[-—:]/g, '').trim()}:** `);
                    });

                    // Cleanup extra newlines
                    newAnswer = newAnswer.replace(/\n{3,}/g, '\n\n');

                    if (newAnswer !== originalAnswer) {
                        q.answer = newAnswer;
                        modifications++;
                    }
                }
            });
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf8');
    console.log(`Success! Modified ${modifications} answers.`);

} catch (err) {
    console.error('Error processing file:', err);
}
