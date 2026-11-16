import { Link } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export interface ProductPublishPanelProps {
  isEditMode: boolean;
  submitting: boolean;
  uploadProgress: number;
  totalAttachmentSize: number;
}

export function ProductPublishPanel({
  isEditMode,
  submitting,
  uploadProgress,
  totalAttachmentSize,
}: ProductPublishPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span>Transfer payload</span>
          <span className="font-mono font-medium text-slate-900 tabular-nums">
            multipart/form-data
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Selected attachments</span>
          <span className="font-mono font-medium text-slate-900 tabular-nums">
            {formatBytes(totalAttachmentSize)}
          </span>
        </div>
      </div>

      {submitting && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Uploading assets...</span>
            <span className="font-mono tabular-nums">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#583cf0] transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-col gap-2.5">
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#583cf0] px-4 py-3 text-sm font-semibold text-white hover:bg-[#492de0] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#583cf0] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <UploadCloud className="h-4 w-4" />
          <span>
            {submitting
              ? 'Publishing...'
              : isEditMode
                ? 'Save Product Changes'
                : 'Publish Product'}
          </span>
        </button>
        <Link
          to="/admin/products"
          className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </section>
  );
}
