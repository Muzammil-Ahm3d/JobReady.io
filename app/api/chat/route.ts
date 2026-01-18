
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// --- Types ---
type Question = {
    id: number;
    categoryId: number;
    title: string;
    slug: string;
    answer: string;
    useCases?: string;
    realTimeUseCases?: string;
};

type DB = {
    questions: Question[];
    categories: any[];
};

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
        }

        const dbContent = await fs.readFile(DB_PATH, 'utf-8');
        const db: DB = JSON.parse(dbContent);

        // 1. Search Local DB
        const lowerQuery = query.toLowerCase();

        // Simple relevance score: matches key words or phrase
        const match = db.questions.find(q => {
            const titleMatch = q.title.toLowerCase().includes(lowerQuery);
            // Exact word match is better, but partial match is okay for now
            return titleMatch;
        });

        if (match) {
            console.log(`🤖 Local Hit for: "${query}" -> "${match.title}"`);
            return NextResponse.json({
                answer: match.answer,
                source: 'local',
                question: match.title
            });
        }

        // 2. AI Fallback
        console.log(`🤖 Local Miss for: "${query}" -> Calling Gemini...`);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI capabilities not configured (Missing API Key)' }, { status: 503 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a helpful coding assistant for JobReady.io. 
        User Question: "${query}"
        
        Provide a concise, clear technical answer (max 3-4 sentences). 
        Format content with Markdown if needed.
        Also provide 1-2 "Real Time Use Cases" if applicable.
        
        Output format (JSON):
        {
            "title": "Refined Question Title",
            "answer": "The answer body...",
            "useCases": "Bullet point 1...",
            "realTimeUseCases": "Bullet point 1..."
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from AI (sanitize if wrapped in ```json)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let aiData;
        try {
            aiData = JSON.parse(jsonStr);
        } catch (e) {
            // Fallback if AI didn't return valid JSON
            aiData = {
                title: query,
                answer: text,
                useCases: '',
                realTimeUseCases: ''
            };
        }

        // 3. Save to DB (Learn)
        const newId = db.questions.length > 0 ? Math.max(...db.questions.map(q => q.id)) + 1 : 1;

        const newQuestion: Question = {
            id: newId,
            categoryId: 999, // AI Knowledge Base
            title: aiData.title || query,
            slug: (aiData.title || query).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            answer: aiData.answer,
            useCases: aiData.useCases,
            realTimeUseCases: aiData.realTimeUseCases
        };

        db.questions.push(newQuestion);
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

        return NextResponse.json({
            answer: newQuestion.answer,
            source: 'ai',
            question: newQuestion.title
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}
