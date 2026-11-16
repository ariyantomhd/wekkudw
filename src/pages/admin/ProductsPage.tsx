import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ProductsTable } from '../../components/products/ProductsTable';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import { PaginationBar } from '../../components/ui/PaginationBar';
import {
  mergeWithDefaultCategories,
  THEMAVIA_CATEGORIES,
} from '../../constants/categories';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import {
  deleteProduct,
  getAdminCategories,
  getAdminProducts,
} from '../../services/productAPI';
import type { ProductStatus } from '../../types/enums';
import type { Product, ProductCategory } from '../../types/product';

type ProductStatusFilter = 'ALL' | ProductStatus;

const STATUS_FILTERS: Array<FilterTabOption<ProductStatusFilter>> = [
  { label: 'All', value: 'ALL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export function ProductsPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>(THEMAVIA_CATEGORIES);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async (targetPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getAdminProducts({ page: targetPage, limit: 20 }),
        getAdminCategories().catch(() => ({ data: [] as ProductCategory[] })),
      ]);
      setProducts(productsRes.data || []);
      setCategories(mergeWithDefaultCategories(categoriesRes.data || []));
      setTotalPages(productsRes.pagination?.total_pages ?? 1);
      setTotalRows(productsRes.pagination?.total_rows);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadProducts(page);
  }, [loadProducts, page]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName =
          item.category?.name ||
          (item.category_id ? categoryNameMap.get(item.category_id) : '') ||
          '';
        return (
          item.title.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, statusFilter, searchQuery, categoryNameMap]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setError(null);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(extractApiErrorMessage(err));
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Digital Products"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Products' },
      ]}
      primaryAction={{
        label: 'Upload Product',
        to: '/admin/products/create',
      }}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-5">
        {error && (
          <AlertBanner
            variant="warning"
            message={error}
            onRetry={() => loadProducts(page)}
          />
        )}

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search products by title, slug, or category..."
          tabs={STATUS_FILTERS}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
          onRefresh={() => loadProducts(page)}
          refreshing={loading}
        />

        <ProductsTable
          products={filteredProducts}
          totalCount={products.length}
          categoryNameMap={categoryNameMap}
          loading={loading}
          onDeleteRequest={setDeleteTarget}
          onResetFilters={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
          }}
        />

        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalRows={totalRows}
          onPageChange={setPage}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Product"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900">{deleteTarget?.title}</span>? This
            action cannot be undone.
          </>
        }
        confirmLabel="Confirm Delete"
        loading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
