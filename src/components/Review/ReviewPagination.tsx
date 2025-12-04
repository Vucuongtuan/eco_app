"use client";

export default function ReviewPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <button
        onClick={prev}
        disabled={page <= 1}
        className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
      >
        Prev
      </button>
      <div>
        Page {page} / {totalPages}
      </div>
      <button
        onClick={next}
        disabled={page >= totalPages}
        className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
