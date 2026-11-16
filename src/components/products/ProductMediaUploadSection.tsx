import { ChangeEvent } from 'react';
import { FileArchive, ImagePlus, Images, Trash2, X } from 'lucide-react';
import type { ProductGallery } from '../../types/product';
import { formatBytes } from '../../utils/formatters';

export interface ImagePreviewItem {
  file: File;
  previewUrl: string;
}

export interface GalleryUploadCardProps {
  galleryFiles: ImagePreviewItem[];
  existingGallery?: ProductGallery[];
  onGallerySelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveGalleryItem: (index: number) => void;
  onRemoveExistingGalleryItem?: (galleryId: string) => void;
}

export function ProductGalleryUploadSection({
  galleryFiles,
  existingGallery = [],
  onGallerySelect,
  onRemoveGalleryItem,
  onRemoveExistingGalleryItem,
}: GalleryUploadCardProps) {
  const hasAnyScreenshots = existingGallery.length > 0 || galleryFiles.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Gallery Screenshots
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload multiple preview screenshots (PNG, JPG, WebP) for the product gallery.
          </p>
        </div>
        <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#583cf0]/40 hover:text-[#583cf0] transition-colors cursor-pointer whitespace-nowrap shrink-0">
          <Images className="h-3.5 w-3.5" />
          <span>Add Screenshots</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={onGallerySelect}
            className="sr-only"
          />
        </label>
      </div>

      {!hasAnyScreenshots ? (
        <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center hover:border-[#583cf0] hover:bg-[#583cf0]/[0.02] transition-colors cursor-pointer">
          <Images className="h-7 w-7 text-slate-400 mb-2" />
          <span className="text-sm font-medium text-slate-700">
            Select multiple gallery screenshots
          </span>
          <span className="mt-1 text-xs text-slate-500">
            Recommended 1600×1200 or 1920×1080 · PNG, JPG, WebP
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={onGallerySelect}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {existingGallery.map((item, idx) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
            >
              <img
                src={item.image_url}
                alt={item.alt_text || `Gallery screenshot ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="aspect-4/3 w-full object-cover"
              />
              <div className="px-2.5 py-2 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-600 truncate">
                  {String(idx + 1).padStart(2, '0')} · Saved
                </span>
                {onRemoveExistingGalleryItem && (
                  <button
                    type="button"
                    onClick={() => onRemoveExistingGalleryItem(item.id)}
                    aria-label={`Remove saved screenshot ${idx + 1}`}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {galleryFiles.map((item, idx) => (
            <div
              key={`${item.file.name}-${idx}`}
              className="group relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
            >
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="aspect-4/3 w-full object-cover"
              />
              <div className="px-2.5 py-2 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-600 truncate">
                  {String(existingGallery.length + idx + 1).padStart(2, '0')} · {item.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveGalleryItem(idx)}
                  aria-label={`Remove ${item.file.name}`}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export interface CoverUploadCardProps {
  coverFile: ImagePreviewItem | null;
  existingCoverUrl: string | null;
  onCoverSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
}

export function ProductCoverUploadCard({
  coverFile,
  existingCoverUrl,
  onCoverSelect,
  onRemoveCover,
}: CoverUploadCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">
          Cover Thumbnail <span className="text-red-500">*</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Primary 1-image product cover displayed in marketplace cards.
        </p>
      </div>

      {coverFile || existingCoverUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <img
              src={coverFile ? coverFile.previewUrl : existingCoverUrl!}
              alt="Cover thumbnail preview"
              referrerPolicy="no-referrer"
              className="aspect-4/3 w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
            <span className="truncate font-mono">
              {coverFile
                ? `${coverFile.file.name} (${formatBytes(coverFile.file.size)})`
                : 'Current cover image'}
            </span>
            <button
              type="button"
              onClick={onRemoveCover}
              className="inline-flex items-center gap-1 text-red-600 hover:underline font-medium shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-10 text-center hover:border-[#583cf0] hover:bg-[#583cf0]/[0.02] transition-colors cursor-pointer">
          <ImagePlus className="h-7 w-7 text-slate-400 mb-2" />
          <span className="text-sm font-medium text-slate-700">
            Upload Cover Thumbnail
          </span>
          <span className="mt-1 text-xs text-slate-500">
            1 image · PNG, JPG or WebP
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onCoverSelect}
            className="sr-only"
          />
        </label>
      )}
    </section>
  );
}

export interface SourceZipCardProps {
  sourceZipFile: File | null;
  existingSourceUrl: string | null;
  onSourceZipSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveSourceZip: () => void;
}

export function ProductSourceZipCard({
  sourceZipFile,
  existingSourceUrl,
  onSourceZipSelect,
  onRemoveSourceZip,
}: SourceZipCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">
          Source Code Archive (.zip) <span className="text-red-500">*</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Deliverable archive unlocked after buyer checkout.
        </p>
      </div>

      {sourceZipFile ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#583cf0]/10 text-[#583cf0] shrink-0">
              <FileArchive className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {sourceZipFile.name}
              </p>
              <p className="text-xs font-mono text-slate-500 tabular-nums">
                {formatBytes(sourceZipFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveSourceZip}
            aria-label="Remove source archive"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center hover:border-[#583cf0] hover:bg-[#583cf0]/[0.02] transition-colors cursor-pointer">
          <FileArchive className="h-7 w-7 text-slate-400 mb-2" />
          <span className="text-sm font-medium text-slate-700">
            {existingSourceUrl ? 'Replace Source .zip Archive' : 'Select Source .zip File'}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            Single .zip archive only
          </span>
          <input
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={onSourceZipSelect}
            className="sr-only"
          />
        </label>
      )}
      {existingSourceUrl && !sourceZipFile && (
        <p className="text-xs font-mono text-slate-500 truncate">
          Existing archive: {existingSourceUrl}
        </p>
      )}
    </section>
  );
}
