import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalRows?: number;
  onPageChange: (nextPage: number) => void;
}

export function PaginationBar({
  page,
  totalPages,
  totalRows,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-600">
      <p className="tabular-nums">
        Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
        {typeof totalRows === 'number' && (
          <span> · {totalRows.toLocaleString()} total records</span>
        )}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
