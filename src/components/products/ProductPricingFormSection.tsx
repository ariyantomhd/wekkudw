import type { ProductStatus } from '../../types/enums';
import { TechStackInput } from '../ui/TechStackInput';

export interface ProductPricingFormSectionProps {
  regularPrice: string;
  extendedPrice: string;
  discountPrice: string;
  currentVersion: string;
  status: ProductStatus;
  livePreviewUrl: string;
  techStack: string[];
  disabled?: boolean;
  onRegularPriceChange: (value: string) => void;
  onExtendedPriceChange: (value: string) => void;
  onDiscountPriceChange: (value: string) => void;
  onCurrentVersionChange: (value: string) => void;
  onStatusChange: (value: ProductStatus) => void;
  onLivePreviewUrlChange: (value: string) => void;
  onTechStackChange: (value: string[]) => void;
}

export function ProductPricingFormSection({
  regularPrice,
  extendedPrice,
  discountPrice,
  currentVersion,
  status,
  livePreviewUrl,
  techStack,
  disabled = false,
  onRegularPriceChange,
  onExtendedPriceChange,
  onDiscountPriceChange,
  onCurrentVersionChange,
  onStatusChange,
  onLivePreviewUrlChange,
  onTechStackChange,
}: ProductPricingFormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">
          Licensing Prices & Tech Stack
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Personal (Regular) and Extended commercial pricing tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="regular-price" className="block text-sm font-medium text-slate-700">
            Regular Price (USD) <span className="text-red-500">*</span>
          </label>
          <input
            id="regular-price"
            type="number"
            min="0"
            step="0.01"
            required
            value={regularPrice}
            onChange={(e) => onRegularPriceChange(e.target.value)}
            placeholder="29.00"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="extended-price" className="block text-sm font-medium text-slate-700">
            Extended Price (USD) <span className="text-red-500">*</span>
          </label>
          <input
            id="extended-price"
            type="number"
            min="0"
            step="0.01"
            required
            value={extendedPrice}
            onChange={(e) => onExtendedPriceChange(e.target.value)}
            placeholder="149.00"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="discount-price" className="block text-sm font-medium text-slate-700">
            Discount Price (Optional)
          </label>
          <input
            id="discount-price"
            type="number"
            min="0"
            step="0.01"
            value={discountPrice}
            onChange={(e) => onDiscountPriceChange(e.target.value)}
            placeholder="19.00"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="current-version" className="block text-sm font-medium text-slate-700">
            Version
          </label>
          <input
            id="current-version"
            type="text"
            value={currentVersion}
            onChange={(e) => onCurrentVersionChange(e.target.value)}
            placeholder="1.0.0"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="product-status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="product-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ProductStatus)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="live-preview-url" className="block text-sm font-medium text-slate-700">
            Live Preview URL
          </label>
          <input
            id="live-preview-url"
            type="url"
            value={livePreviewUrl}
            onChange={(e) => onLivePreviewUrlChange(e.target.value)}
            placeholder="https://demo.themavia.com/..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Tech Stack Tags
        </label>
        <TechStackInput
          value={techStack}
          onChange={onTechStackChange}
          disabled={disabled}
        />
      </div>
    </section>
  );
}
