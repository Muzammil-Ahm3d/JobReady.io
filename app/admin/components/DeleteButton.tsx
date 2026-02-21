'use client';

export default function DeleteButton({ action }: { action: () => Promise<void> }) {
    const handleDelete = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this question? This action cannot be undone.');
        if (confirmed) {
            await action();
        }
    };

    return (
        <button
            onClick={handleDelete}
            style={{
                cursor: 'pointer',
                color: '#ef4444',
                background: 'transparent',
                border: 'none',
                fontWeight: 500,
                fontSize: 'inherit',
            }}
        >
            Delete
        </button>
    );
}
