import { Link } from 'react-router-dom';
import { Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import type { Product } from '../../types/product';
import { formatCurrency } from '../../utils/formatters';
import { ProductStatusLabel } from '../ui/StatusLabel';

export interface ProductsTableProps {
  products: Product[];
  totalCount: number;
  categoryNameMap: Map<string, string>;
  loading: boolean;
  onDeleteRequest: (product: Product) => void;
  onResetFilters: () => void;
}

export function ProductsTable({
  products,
  totalCount,
  categoryNameMap,
  loading,
  onDeleteRequest,
  onResetFilters,
}: ProductsTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {loading ? (
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 rounded-lg bg-slate-100 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-44 rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-sm font-semibold text-slate-900">
            {totalCount === 0
              ? 'No digital products found'
              : 'No products match the active filter'}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            {totalCount === 0
              ? 'Publish your first theme, template, or source code package to populate the Themavia Market catalog.'
              : 'Try clearing your search query or switching to another product status filter.'}
          </p>
          <div className="mt-5">
            {totalCount === 0 ? (
              <Link
                to="/admin/products/create"
                className="inline-flex items-center rounded-xl bg-[#583cf0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#492de0] transition-colors"
              >
                Upload New Product
              </Link>
            ) : (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Product Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Personal Price</th>
                <th className="py-3 px-4 text-right">Extended Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.map((product) => {
                const categoryLabel =
                  product.category?.name ||
                  (product.category_id ? categoryNameMap.get(product.category_id) : null) ||
                  'Uncategorized';

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        {product.images_url ? (
                          <img
                            src={product.images_url}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                        ) : (
                          <div className="h-10 w-14 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-[280px]">
                            {product.title}
                          </p>
                          <p className="text-xs font-mono text-slate-500 truncate max-w-[280px]">
                            /{product.slug} · v{product.current_version || '1.0.0'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {categoryLabel}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-medium text-slate-900 tabular-nums whitespace-nowrap">
                      {formatCurrency(product.regular_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-medium text-slate-900 tabular-nums whitespace-nowrap">
                      {formatCurrency(product.extended_price)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <ProductStatusLabel status={product.status} />
                    </td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-[#583cf0]/40 hover:text-[#583cf0] transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(product)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
