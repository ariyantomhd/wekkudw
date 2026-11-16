// src/components/blog/BlogFormModal.tsx
import React, { useEffect, useState } from 'react';
import { FileText, Save, X } from 'lucide-react';
import type {
  BlogArticle,
  BlogCategory,
  SaveBlogArticlePayload,
} from '../../services/blogAPI';

interface BlogFormModalProps {
  isOpen: boolean;
  categories: BlogCategory[];
  editingArticle: BlogArticle | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: SaveBlogArticlePayload, editingId?: number) => Promise<void>;
}

export function BlogFormModal({
  isOpen,
  categories,
  editingArticle,
  submitting,
  onClose,
  onSubmit,
}: BlogFormModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [author, setAuthor] = useState('Themavia Editorial');
  const [imageUrl, setImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentText, setContentText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLocalError(null);

    if (editingArticle) {
      setTitle(editingArticle.title);
      setSlug(editingArticle.slug);
      setCategoryId(editingArticle.category_id ? String(editingArticle.category_id) : '');
      setAuthor(editingArticle.author || 'Themavia Editorial');
      setImageUrl(editingArticle.image_url || '');
      setExcerpt(editingArticle.excerpt || '');
      setContentText(
        Array.isArray(editingArticle.content) ? editingArticle.content.join('\n\n') : ''
      );
      setIsFeatured(Boolean(editingArticle.is_featured));
      setStatus(editingArticle.status || 'PUBLISHED');
    } else {
      setTitle('');
      setSlug('');
      setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
      setAuthor('Themavia Editorial');
      setImageUrl('');
      setExcerpt('');
      setContentText('');
      setIsFeatured(false);
      setStatus('PUBLISHED');
    }
  }, [isOpen, editingArticle, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const paragraphs = contentText
      .split(/\n{2,}|\r\n\r\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (title.trim().length < 4) {
      setLocalError('Judul artikel minimal 4 karakter.');
      return;
    }

    if (paragraphs.length === 0) {
      setLocalError('Konten artikel wajib diisi minimal 1 paragraf.');
      return;
    }

    await onSubmit(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || null,
        content: paragraphs,
        category_id: categoryId ? Number(categoryId) : null,
        author: author.trim() || 'Themavia Editorial',
        image_url: imageUrl.trim() || null,
        is_featured: isFeatured,
        status,
      },
      editingArticle?.id
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black">
                {editingArticle ? 'Edit Blog Article' : 'Write New Blog Article'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Pisahkan setiap paragraf dengan baris kosong (Enter 2x)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[84vh] overflow-y-auto">
          {localError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700">
              {localError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to Launch a Full-Stack SaaS MVP in 48 Hours"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                URL Slug (Opsional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="launch-fullstack-saas-mvp"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Author Name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Cover Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Short Excerpt (Ringkasan Kartu Blog)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat artikel untuk SEO dan preview kartu..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Article Paragraphs (content: string[]) *
            </label>
            <textarea
              rows={6}
              required
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder={'Tulis paragraf pertama di sini...\n\nTekan Enter 2 kali untuk paragraf kedua...'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 accent-orange-500 rounded"
              />
              <span>Pin sebagai Featured Article</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold text-slate-900"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-xs font-extrabold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>
                {submitting ? 'Saving...' : editingArticle ? 'Update Article' : 'Publish Article'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}