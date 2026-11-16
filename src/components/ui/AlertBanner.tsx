import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export interface AlertBannerProps {
  variant?: 'error' | 'warning' | 'success';
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function AlertBanner({
  variant = 'warning',
  message,
  onRetry,
  retryLabel = 'Retry',
}: AlertBannerProps) {
  const styles =
    variant === 'error'
      ? 'border-red-200 bg-red-50/80 text-red-800'
      : variant === 'success'
        ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
        : 'border-amber-200 bg-amber-50/70 text-amber-900';

  const iconColor =
    variant === 'error'
      ? 'text-red-600'
      : variant === 'success'
        ? 'text-emerald-600'
        : 'text-amber-600';

  return (
    <div
      role={variant === 'success' ? 'status' : 'alert'}
      className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${styles}`}
    >
      <div className="flex items-start gap-2.5 text-sm">
        {variant === 'success' ? (
          <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
        ) : (
          <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
        )}
        <span>{message}</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
