'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export default function Modal({ children }: { children: React.ReactNode }) {
    const overlay = useRef(null);
    const wrapper = useRef(null);
    const router = useRouter();

    const onDismiss = useCallback(() => {
        router.back();
    }, [router]);

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === overlay.current || e.target === wrapper.current) {
                if (onDismiss) onDismiss();
            }
        },
        [onDismiss, overlay, wrapper]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        },
        [onDismiss]
    );

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; }
    }, []);

    return (
        <div ref={overlay} className={styles.overlay} onClick={onClick}>
            <div ref={wrapper} className={styles.modal}>
                <button onClick={onDismiss} className={styles.closeButton} aria-label="Close modal">
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}
