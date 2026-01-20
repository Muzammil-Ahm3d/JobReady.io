import { getDB, saveDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDB();
        let updatedCount = 0;

        db.questions = db.questions.map(q => {
            let newAnswer = q.answer;

            // 1. Replace "emoji bullets" with Markdown list items
            // Matches: ☑️, ☝️, ✌️, 🤟, ✋, 👌, 🫱, 🫲, 🫳, 🫴, 👏, 🙌, 👉
            // We add a double newline before to ensure it starts a list, and a space after.
            newAnswer = newAnswer.replace(/([☑️☝️✌️🤟✋👌🫱🫲🫳🫴👏🙌👉])/g, '\n- ');

            // 2. Replace arrows with colon
            newAnswer = newAnswer.replace(/=>/g, ': ');

            // 3. Replace stars with Header 3
            newAnswer = newAnswer.replace(/\*\*\*/g, '\n\n### ');

            // 4. Fix potential spacing issues (multiple newlines)
            newAnswer = newAnswer.replace(/\n\s*\n/g, '\n\n');

            if (newAnswer !== q.answer) {
                updatedCount++;
                return { ...q, answer: newAnswer };
            }
            return q;
        });

        if (updatedCount > 0) {
            await saveDB(db);
            return NextResponse.json({
                success: true,
                message: `Successfully reformatted ${updatedCount} questions.`,
                sample: db.questions.find(q => q.id === 3)?.answer
            });
        }

        return NextResponse.json({ success: true, message: 'No questions needed reformatting.' });

    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
