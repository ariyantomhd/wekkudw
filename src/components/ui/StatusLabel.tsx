// src/components/ui/StatusLabel.tsx
import {
  Archive,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import type { OrderStatus, ProductStatus } from '../../types/enums';

export function ProductStatusLabel({ status }: { status: ProductStatus }) {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Published
        </span>
      );
    case 'PENDING_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-700">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          Pending Review
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600">
          <Archive className="h-3.5 w-3.5 text-slate-500" />
          Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
          <FileText className="h-3.5 w-3.5 text-slate-500" />
          Draft
        </span>
      );
  }
}

export function OrderStatusLabel({
  status,
  uppercase = false,
}: {
  status: OrderStatus;
  uppercase?: boolean;
}) {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {uppercase ? 'PAID' : 'Paid'}
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          {uppercase ? 'PENDING' : 'Pending'}
        </span>
      );
    case 'REFUNDED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-700">
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          {uppercase ? 'REFUNDED' : 'Refunded'}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200/80 px-2.5 py-1 text-[11px] font-mono font-bold text-rose-700">
          <XCircle className="h-3.5 w-3.5 text-rose-600" />
          {uppercase ? status : status === 'EXPIRED' ? 'Expired' : 'Failed'}
        </span>
      );
  }
}