import React from 'react';

export default function Pagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
}) {
    if (!totalPages || totalPages <= 1) return null;

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <nav className="mt-6 flex items-center justify-center gap-2">
            <button
                aria-label="prev"
                className="px-3 py-1 rounded-md bg-[#0f0b1a] text-sm text-[#9aa0c7] disabled:opacity-40"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
            >
                ◀
            </button>

            {start > 1 && (
                <button
                    className="px-3 py-1 rounded-md bg-[#0d0a16] text-sm text-[#b7bdd9]"
                    onClick={() => onPageChange(1)}
                >
                    1
                </button>
            )}

            {start > 2 && <span className="px-2 text-[#6f7388]">…</span>}

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={
                        'px-3 py-1 rounded-md text-sm ' +
                        (p === page
                            ? 'bg-gradient-to-r from-[#2b6ef6] to-[#7b61ff] text-white font-semibold'
                            : 'bg-[#0d0a16] text-[#b7bdd9]')
                    }
                >
                    {p}
                </button>
            ))}

            {end < totalPages - 1 && (
                <span className="px-2 text-[#6f7388]">…</span>
            )}

            {end < totalPages && (
                <button
                    className="px-3 py-1 rounded-md bg-[#0d0a16] text-sm text-[#b7bdd9]"
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </button>
            )}

            <button
                aria-label="next"
                className="px-3 py-1 rounded-md bg-[#0f0b1a] text-sm text-[#9aa0c7] disabled:opacity-40"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
            >
                ▶
            </button>
        </nav>
    );
}
