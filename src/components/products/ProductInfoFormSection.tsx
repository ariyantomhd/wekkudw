import type { ProductCategory } from '../../types/product';

export interface ProductInfoFormSectionProps {
  title: string;
  slug: string;
  slugManuallyEdited: boolean;
  categoryId: string;
  description: string;
  categories: ProductCategory[];
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSyncSlugFromTitle: () => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function ProductInfoFormSection({
  title,
  slug,
  slugManuallyEdited,
  categoryId,
  description,
  categories,
  onTitleChange,
  onSlugChange,
  onSyncSlugFromTitle,
  onCategoryChange,
  onDescriptionChange,
}: ProductInfoFormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">
          Product Information
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Core catalog metadata stored in Supabase products table.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="product-title" className="block text-sm font-medium text-slate-700">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            id="product-title"
            type="text"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. SaaSFlow — Modern Admin Dashboard Template"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="product-slug" className="block text-sm font-medium text-slate-700">
              URL Slug <span className="text-red-500">*</span>
            </label>
            {slugManuallyEdited && (
              <button
                type="button"
                onClick={onSyncSlugFromTitle}
                className="text-xs font-medium text-[#583cf0] hover:underline"
              >
                Sync from title
              </button>
            )}
          </div>
          <input
            id="product-slug"
            type="text"
            required
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="saasflow-admin-dashboard-template"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="product-category" className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="product-description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="product-description"
            rows={5}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe features, included pages, installation notes, and license scope..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15 transition-colors"
          />
        </div>
      </div>
    </section>
  );
}
