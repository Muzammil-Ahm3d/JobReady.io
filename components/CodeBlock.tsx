'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export default function CodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
    if (!code) return null;

    return (
        <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{
                background: '#1e1e1e',
                padding: '0.5rem 1rem',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ color: '#9cdcfe', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    {language}
                </span>
                <span style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></span>
                </span>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1rem', fontSize: '0.9rem', lineHeight: '1.5' }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
