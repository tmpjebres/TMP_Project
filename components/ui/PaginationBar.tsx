'use client';

interface Props {
  page: number;
  setPage: (p: number) => void;
  total: number;
  pageSize: number;
}

export function PaginationBar({ page, setPage, total, pageSize }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-40 text-sm hover:bg-neutral-light-gray transition-colors"
      >
        Prev
      </button>
      <span className="px-2 text-sm">
        {page} / {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-40 text-sm hover:bg-neutral-light-gray transition-colors"
      >
        Next
      </button>
    </div>
  );
}
