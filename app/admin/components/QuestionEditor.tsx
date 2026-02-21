'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import styles from './QuestionEditor.module.css';

type EditorMode = 'edit' | 'preview' | 'split';
type BlockType = 'heading' | 'text' | 'code' | 'image';

interface ContentBlock {
    id: string;
    type: BlockType;
    value: string;
    language?: string;
}

interface QuestionEditorProps {
    name: string;
    defaultValue?: string;
    required?: boolean;
    label?: string;
}

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// Parse markdown into ordered blocks
function parseMarkdownToBlocks(markdown: string): ContentBlock[] {
    if (!markdown.trim()) return [{ id: generateId(), type: 'text', value: '' }];

    const blocks: ContentBlock[] = [];
    let remaining = markdown.trim();

    while (remaining.length > 0) {
        // Check for heading at start of remaining text
        const headingMatch = remaining.match(/^(#{1,3}) (.+?)(?:\n|$)/);
        if (headingMatch) {
            blocks.push({ id: generateId(), type: 'heading', value: headingMatch[2].trim() });
            remaining = remaining.slice(headingMatch[0].length).trim();
            continue;
        }

        // Check for code block
        const codeMatch = remaining.match(/^```(\w*)\n([\s\S]*?)```/);
        if (codeMatch) {
            blocks.push({ id: generateId(), type: 'code', value: codeMatch[2].trim(), language: codeMatch[1] || 'javascript' });
            remaining = remaining.slice(codeMatch[0].length).trim();
            continue;
        }

        // Check for image
        const imageMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
            blocks.push({ id: generateId(), type: 'image', value: imageMatch[2] });
            remaining = remaining.slice(imageMatch[0].length).trim();
            continue;
        }

        // Text: grab everything until next heading, code block, or image
        const nextSpecial = remaining.search(/\n(#{1,3} |```|!\[)/);
        if (nextSpecial > 0) {
            blocks.push({ id: generateId(), type: 'text', value: remaining.slice(0, nextSpecial).trim() });
            remaining = remaining.slice(nextSpecial).trim();
        } else {
            blocks.push({ id: generateId(), type: 'text', value: remaining.trim() });
            remaining = '';
        }
    }

    return blocks.length > 0 ? blocks : [{ id: generateId(), type: 'text', value: '' }];
}

// Serialize blocks to markdown
function blocksToMarkdown(blocks: ContentBlock[]): string {
    return blocks.map(block => {
        if (block.type === 'heading' && block.value.trim()) return `## ${block.value.trim()}`;
        if (block.type === 'text' && block.value.trim()) return block.value.trim();
        if (block.type === 'code' && block.value.trim()) return `\`\`\`${block.language || 'javascript'}\n${block.value.trim()}\n\`\`\``;
        if (block.type === 'image' && block.value.trim()) return `![image](${block.value.trim()})`;
        return '';
    }).filter(Boolean).join('\n\n');
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'csharp', 'sql', 'html', 'css', 'bash', 'json', 'yaml', 'go', 'ruby', 'php', 'kotlin', 'swift', 'rust', 'cpp', 'c'];

export default function QuestionEditor({
    name,
    defaultValue = '',
    required = false,
    label = 'Answer',
}: QuestionEditorProps) {
    const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseMarkdownToBlocks(defaultValue));
    const [mode, setMode] = useState<EditorMode>('edit');

    const fullMarkdown = blocksToMarkdown(blocks);

    const addBlock = (type: BlockType) => {
        setBlocks(prev => [...prev, {
            id: generateId(), type, value: '',
            language: type === 'code' ? 'javascript' : undefined,
        }]);
    };

    const updateBlock = (id: string, value: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b));
    };

    const updateLanguage = (id: string, language: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, language } : b));
    };

    const removeBlock = (id: string) => {
        if (blocks.length <= 1) return;
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        setBlocks(prev => {
            const i = prev.findIndex(b => b.id === id);
            if (i === -1) return prev;
            if (direction === 'up' && i === 0) return prev;
            if (direction === 'down' && i === prev.length - 1) return prev;
            const arr = [...prev];
            const j = direction === 'up' ? i - 1 : i + 1;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            return arr;
        });
    };

    const showEditor = mode === 'edit' || mode === 'split';
    const showPreview = mode === 'preview' || mode === 'split';

    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '1.05rem' }}>{label}</label>
            <input type="hidden" name={name} value={fullMarkdown} />

            <div className={styles.editorContainer}>
                <div className={styles.toolbar} style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                        {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                    </span>
                    <div className={styles.modeTabs}>
                        <button type="button" className={mode === 'edit' ? styles.modeTabActive : styles.modeTab} onClick={() => setMode('edit')}>Edit</button>
                        <button type="button" className={mode === 'split' ? styles.modeTabActive : styles.modeTab} onClick={() => setMode('split')}>Split</button>
                        <button type="button" className={mode === 'preview' ? styles.modeTabActive : styles.modeTab} onClick={() => setMode('preview')}>Preview</button>
                    </div>
                </div>

                <div className={styles.editorBody}>
                    {showEditor && (
                        <div className={styles.editorPane} style={{ overflowY: 'auto', padding: '12px' }}>
                            {blocks.map((block, idx) => (
                                <div key={block.id} className={styles.blockContainer}>
                                    <div className={styles.blockHeader}>
                                        <span className={
                                            block.type === 'heading' ? styles.blockBadgeHeading :
                                                block.type === 'text' ? styles.blockBadgeText :
                                                    block.type === 'code' ? styles.blockBadgeCode :
                                                        styles.blockBadgeImage
                                        }>
                                            {block.type === 'heading' ? '📌 Heading' : block.type === 'text' ? '📝 Text' : block.type === 'code' ? '💻 Code' : '🖼️ Image'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '3px' }}>
                                            <button type="button" className={styles.blockSmallBtn} onClick={() => moveBlock(block.id, 'up')} disabled={idx === 0}>↑</button>
                                            <button type="button" className={styles.blockSmallBtn} onClick={() => moveBlock(block.id, 'down')} disabled={idx === blocks.length - 1}>↓</button>
                                            {blocks.length > 1 && (
                                                <button type="button" className={styles.blockDeleteBtn} onClick={() => removeBlock(block.id)}>✕</button>
                                            )}
                                        </div>
                                    </div>

                                    {block.type === 'heading' && (
                                        <input
                                            type="text"
                                            value={block.value}
                                            onChange={(e) => updateBlock(block.id, e.target.value)}
                                            placeholder="Sub-heading text..."
                                            className={styles.headingInput}
                                        />
                                    )}

                                    {block.type === 'text' && (
                                        <textarea
                                            value={block.value}
                                            onChange={(e) => {
                                                updateBlock(block.id, e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                                e.target.style.overflow = 'hidden';
                                                e.target.style.resize = 'none';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.height = '150px';
                                                e.target.style.overflow = 'auto';
                                                e.target.style.resize = 'vertical';
                                            }}
                                            placeholder="Write content... (Markdown: **bold**, *italic*, - lists)"
                                            className={styles.sectionTextarea}
                                            rows={4}
                                        />
                                    )}

                                    {block.type === 'code' && (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                                                <select value={block.language || 'javascript'} onChange={(e) => updateLanguage(block.id, e.target.value)} className={styles.langSelect}>
                                                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                            </div>
                                            <textarea
                                                value={block.value}
                                                onChange={(e) => {
                                                    updateBlock(block.id, e.target.value);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                                    e.target.style.overflow = 'hidden';
                                                    e.target.style.resize = 'none';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.height = '150px';
                                                    e.target.style.overflow = 'auto';
                                                    e.target.style.resize = 'vertical';
                                                }}
                                                placeholder="// Paste your code here..."
                                                className={styles.sectionCodeArea}
                                                rows={4}
                                            />
                                        </div>
                                    )}

                                    {block.type === 'image' && (
                                        <input
                                            type="text"
                                            value={block.value}
                                            onChange={(e) => updateBlock(block.id, e.target.value)}
                                            placeholder="https://example.com/image.png"
                                            className={styles.sectionInput}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Add Block Buttons */}
                            <div className={styles.addBlockRow}>
                                <button type="button" className={styles.addBlockBtn} onClick={() => addBlock('heading')}>+ Heading</button>
                                <button type="button" className={styles.addBlockBtn} onClick={() => addBlock('text')}>+ Text</button>
                                <button type="button" className={styles.addBlockBtn} onClick={() => addBlock('code')}>+ Code</button>
                                <button type="button" className={styles.addBlockBtn} onClick={() => addBlock('image')}>+ Image</button>
                            </div>
                        </div>
                    )}

                    {showPreview && (
                        <div className={showEditor ? styles.previewPane : styles.previewPaneFull}>
                            {fullMarkdown.trim() ? (
                                <div className={styles.previewContent}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{fullMarkdown}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className={styles.previewEmpty}>Add content to see preview...</div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.tooltip}>
                    Add blocks in any order: Heading → Text → Code → Image → Text → Code... Use Split/Preview to see output.
                </div>
            </div>
        </div>
    );
}
