const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    let updatedCount = 0;

    db.questions = db.questions.map(q => {
        let newAnswer = q.answer;

        // Same regex logic as the API route
        newAnswer = newAnswer.replace(/([☑️☝️✌️🤟✋👌🫱🫲🫳🫴👏🙌👉])/g, '\n- ');
        newAnswer = newAnswer.replace(/=>/g, ': ');
        newAnswer = newAnswer.replace(/\*\*\*/g, '\n\n### ');
        newAnswer = newAnswer.replace(/\n\s*\n/g, '\n\n');

        if (newAnswer !== q.answer) {
            updatedCount++;
            return { ...q, answer: newAnswer };
        }
        return q;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        console.log(`Successfully reformatted ${updatedCount} questions in local DB.`);
    } else {
        console.log('No questions needed reformatting locally.');
    }

} catch (err) {
    console.error('Error:', err);
}
