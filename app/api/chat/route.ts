import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDB, saveDB, Question } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.content;

        // Construct conversation history for context
        // We limit to last 6 messages for context window efficiency
        const history = messages.slice(-6).map((m: any) =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');

        const db = await getDB();

        // 1. Search Local DB (Only checks the LATEST question)
        const lowerQuery = query.toLowerCase();

        // Simple relevance score: matches key words or phrase
        const match = db.questions.find(q => {
            const titleMatch = q.title.toLowerCase().includes(lowerQuery);
            return titleMatch;
        });

        // Note: For "contextual" queries like "give me code for that", local search might fail 
        // because "that" is not a keyword. In a real vector DB we'd use embeddings. 
        // Here, if local search fails, we fall back to AI which DOES have context.

        if (match && query.length > 10) { // Only use local match if query seems substantial
            console.log(`🤖 Local Hit for: "${query}" -> "${match.title}"`);
            return NextResponse.json({
                answer: match.answer,
                source: 'local',
                question: match.title,
                codeSnippet: match.codeSnippet
            });
        }

        // 2. AI Fallback (With Context)
        console.log(`🤖 Local Miss -> AI Context Search`);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI capabilities not configured (Missing API Key)' }, { status: 503 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `You are a helpful coding assistant for JobReady.io. 
        
        Current Conversation History:
        ${history}
        
        Task: Answer the LAST User message based on the history above.
        - If the user refers to previous code/topics (e.g., "rewrite that", "give me code for it"), use the context.
        - Output strict JSON.
        
        Output format (JSON):
        {
            "title": "Refined Question Title (based on context)",
            "answer": "The answer body (markdown allowed)...",
            "codeSnippet": "Optional code block content...",
            "useCases": "Bullet point 1...",
            "realTimeUseCases": "Bullet point 1..."
        }`;

        const result = await model.generateContent(systemPrompt);
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
                realTimeUseCases: '',
                codeSnippet: ''
            };
        }

        // 3. Save to DB (Learn)
        // Only save meaningful answers, not short chitchat if possible, but for now save all AI interactions.
        const newId = db.questions.length > 0 ? Math.max(...db.questions.map(q => q.id)) + 1 : 1;

        const newQuestion: Question = {
            id: newId,
            categoryId: 999, // AI Knowledge Base
            title: aiData.title || query,
            slug: (aiData.title || query).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            answer: aiData.answer,
            displayOrder: db.questions.length + 1,
            useCases: aiData.useCases,
            realTimeUseCases: aiData.realTimeUseCases,
            codeSnippet: aiData.codeSnippet
        };

        db.questions.push(newQuestion);

        // Save using the smart saveDB (works on both Vercel and Hostinger)
        const saved = await saveDB(db);
        if (!saved) {
            console.warn('⚠️ Could not persist to storage, but returning answer anyway');
        }

        return NextResponse.json({
            answer: newQuestion.answer,
            source: 'ai',
            question: newQuestion.title,
            codeSnippet: newQuestion.codeSnippet
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}
