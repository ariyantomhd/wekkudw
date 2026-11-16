// src/pages/admin/BlogPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  FolderPlus,
  MessageSquare,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import { BlogFormModal } from '../../components/blog/BlogFormModal';
import { SocialShareModal } from '../../components/blog/SocialShareModal';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import {
  BlogArticle,
  BlogCategory,
  createAdminBlogArticle,
  createAdminBlogCategory,
  deleteAdminBlogArticle,
  getAdminBlogArticles,
  getAdminBlogCategories,
  SaveBlogArticlePayload,
  updateAdminBlogArticle,
} from '../../services/blogAPI';
import { formatDateTime } from '../../utils/formatters';

type BlogStatusTab = 'ALL' | 'PUBLISHED' | 'DRAFT';

const STATUS_TABS: Array<FilterTabOption<BlogStatusTab>> = [
  { label: 'All Posts', value: 'ALL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Drafts', value: 'DRAFT' },
];

export function BlogPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<BlogStatusTab>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sharingArticle, setSharingArticle] = useState<BlogArticle | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getAdminBlogCategories();
      setCategories(cats);
    } catch {
      // Abaikan jika gagal memuat kategori
    }
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAdminBlogArticles({
        status: statusTab !== 'ALL' ? statusTab : undefined,
        category_id: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setArticles(list);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusTab, categoryFilter, searchQuery]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadArticles();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadArticles]);

  const stats = useMemo(() => {
    const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
    const featuredCount = articles.filter((a) => a.is_featured).length;
    return {
      total: articles.length,
      publishedCount,
      featuredCount,
    };
  }, [articles]);

  const handleQuickAddCategory = async () => {
    const name = window.prompt('Masukkan nama kategori blog baru:');
    if (!name || !name.trim()) return;
    try {
      await createAdminBlogCategory({ name: name.trim() });
      await loadCategories();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleSaveArticle = async (payload: SaveBlogArticlePayload, editingId?: number) => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await updateAdminBlogArticle(editingId, payload);
      } else {
        await createAdminBlogArticle(payload);
      }
      setModalOpen(false);
      setEditingArticle(null);
      await Promise.all([loadArticles(), loadCategories()]);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (article: BlogArticle) => {
    if (!window.confirm(`Hapus artikel "${article.title}"?`)) return;
    try {
      await deleteAdminBlogArticle(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <AdminLayout
      title="Blog & Content Marketing"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Blog' },
      ]}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* KPI & Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Total Articles
              </p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1">
                {stats.total}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Published Live
              </p>
              <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {stats.publishedCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Featured Posts
              </p>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {stats.featuredCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingArticle(null);
              setModalOpen(true);
            }}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white p-5 flex items-center justify-center gap-2.5 font-extrabold text-sm transition shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Write New Article</span>
          </button>
        </div>

        {error && <AlertBanner variant="warning" message={error} onRetry={loadArticles} />}

        {/* Filter Toolbar + Category Pills */}
        <div className="space-y-3">
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search article title, slug, or excerpt..."
            tabs={STATUS_TABS}
            activeTab={statusTab}
            onTabChange={setStatusTab}
            onRefresh={loadArticles}
            refreshing={loading}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Category:
              </span>
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  categoryFilter === 'ALL'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-400'
                }`}
              >
                All ({stats.total})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(String(cat.id))}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    categoryFilter === String(cat.id)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-400'
                  }`}
                >
                  {cat.name} ({cat.count ?? 0})
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleQuickAddCategory}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-orange-500 hover:text-orange-600 transition cursor-pointer"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>+ New Category</span>
            </button>
          </div>
        </div>

        {/* Articles Table */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-2">
              <p className="text-sm font-extrabold text-slate-900">
                Belum ada artikel blog
              </p>
              <p className="text-xs text-slate-500">
                Klik "Write New Article" untuk mulai mempublikasikan tutorial atau pengumuman rilis.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-900 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                    <th className="py-3.5 px-6">Article & Slug</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Author & Date</th>
                    <th className="py-3.5 px-4">Comments</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Share & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-orange-50/35 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-slate-900 max-w-70 truncate">
                            {art.title}
                          </p>
                          {art.is_featured && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-mono font-black text-amber-800">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-70">
                          /blog/{art.slug}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                          {art.category || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-xs font-bold text-slate-700">{art.author}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {formatDateTime(art.published_at || art.created_at)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                          {art.comments_count ?? 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {art.status === 'PUBLISHED' ? (
                          <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-700">
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="inline-flex rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700">
                            DRAFT
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Share to Social Media"
                            onClick={() => setSharingArticle(art)}
                            className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[11px] font-bold text-orange-700 hover:bg-orange-100 transition cursor-pointer"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </button>

                          <button
                            type="button"
                            title="Edit Article"
                            onClick={() => {
                              setEditingArticle(art);
                              setModalOpen(true);
                            }}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-orange-500 hover:text-orange-600 transition cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Delete Article"
                            onClick={() => handleDelete(art)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-rose-500 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <BlogFormModal
        isOpen={modalOpen}
        categories={categories}
        editingArticle={editingArticle}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleSaveArticle}
      />

      <SocialShareModal
        article={sharingArticle}
        onClose={() => setSharingArticle(null)}
      />
    </AdminLayout>
  );
}