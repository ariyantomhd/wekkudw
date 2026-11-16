import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ProductInfoFormSection } from '../../components/products/ProductInfoFormSection';
import {
  ImagePreviewItem,
  ProductCoverUploadCard,
  ProductGalleryUploadSection,
  ProductSourceZipCard,
} from '../../components/products/ProductMediaUploadSection';
import { ProductPricingFormSection } from '../../components/products/ProductPricingFormSection';
import { ProductPublishPanel } from '../../components/products/ProductPublishPanel';
import { AlertBanner } from '../../components/ui/AlertBanner';
import {
  mergeWithDefaultCategories,
  THEMAVIA_CATEGORIES,
} from '../../constants/categories';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import {
  createProduct,
  getAdminCategories,
  getAdminProductById,
  updateProduct,
} from '../../services/productAPI';
import type { ProductStatus } from '../../types/enums';
import type { ProductCategory, ProductGallery } from '../../types/product';
import { toSlug } from '../../utils/formatters';

export function ProductCreatePage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { adminUser, signingOut, handleLogout } = useAdminSession();

  // Text & metadata fields aligned with Product interface
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [extendedPrice, setExtendedPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [livePreviewUrl, setLivePreviewUrl] = useState('');
  const [status, setStatus] = useState<ProductStatus>('PUBLISHED');
  const [techStack, setTechStack] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);

  // File upload states
  const [coverFile, setCoverFile] = useState<ImagePreviewItem | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<ImagePreviewItem[]>([]);
  const [existingGallery, setExistingGallery] = useState<ProductGallery[]>([]);
  const [removedGalleryIds, setRemovedGalleryIds] = useState<string[]>([]);
  const [sourceZipFile, setSourceZipFile] = useState<File | null>(null);
  const [existingSourceUrl, setExistingSourceUrl] = useState<string | null>(null);

  // Reference & submission states
  const [categories, setCategories] = useState<ProductCategory[]>(THEMAVIA_CATEGORIES);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getAdminCategories()
      .then((res) => setCategories(mergeWithDefaultCategories(res.data || [])))
      .catch(() => setCategories(THEMAVIA_CATEGORIES));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoadingInitial(true);
    getAdminProductById(id)
      .then((res) => {
        const p = res.data;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setSlugManuallyEdited(true);
        setDescription(p.description || '');
        setCategoryId(p.category_id || '');
        setRegularPrice(String(p.regular_price ?? ''));
        setExtendedPrice(String(p.extended_price ?? ''));
        setDiscountPrice(
          p.discount_price !== null && p.discount_price !== undefined
            ? String(p.discount_price)
            : '',
        );
        setCurrentVersion(p.current_version || '1.0.0');
        setLivePreviewUrl(p.live_preview_url || '');
        setStatus(p.status || 'DRAFT');
        setTechStack(p.tech_stack || []);
        setExistingCoverUrl(p.images_url || null);
        setExistingGallery(p.gallery || []);
        setExistingSourceUrl(p.file_source_url || null);
      })
      .catch((err) => setErrorMessage(extractApiErrorMessage(err)))
      .finally(() => setLoadingInitial(false));
  }, [id]);

  useEffect(() => {
    return () => {
      if (coverFile) URL.revokeObjectURL(coverFile.previewUrl);
      galleryFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [coverFile, galleryFiles]);

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    if (!slugManuallyEdited) {
      setSlug(toSlug(nextTitle));
    }
  };

  const handleCoverSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverFile) URL.revokeObjectURL(coverFile.previewUrl);
    setCoverFile({ file, previewUrl: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const handleRemoveCover = () => {
    if (coverFile) URL.revokeObjectURL(coverFile.previewUrl);
    setCoverFile(null);
    setExistingCoverUrl(null);
  };

  const handleGallerySelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setGalleryFiles((prev) => [
      ...prev,
      ...selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = '';
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGalleryFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleSourceZipSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage('Source package must be a valid .zip archive.');
      e.target.value = '';
      return;
    }
    setErrorMessage(null);
    setSourceZipFile(file);
    e.target.value = '';
  };

  const totalAttachmentSize = useMemo(() => {
    let total = 0;
    if (coverFile) total += coverFile.file.size;
    galleryFiles.forEach((g) => {
      total += g.file.size;
    });
    if (sourceZipFile) total += sourceZipFile.size;
    return total;
  }, [coverFile, galleryFiles, sourceZipFile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) return setErrorMessage('Product title is required.');
    if (!slug.trim()) return setErrorMessage('Product slug is required.');

    const parsedRegular = Number(regularPrice);
    const parsedExtended = Number(extendedPrice);
    if (isNaN(parsedRegular) || parsedRegular < 0 || regularPrice === '') {
      return setErrorMessage('Please provide a valid Regular (Personal) license price.');
    }
    if (isNaN(parsedExtended) || parsedExtended < 0 || extendedPrice === '') {
      return setErrorMessage('Please provide a valid Extended license price.');
    }
    if (!coverFile && !existingCoverUrl) {
      return setErrorMessage('Please upload 1 main cover thumbnail image.');
    }
    if (!sourceZipFile && !existingSourceUrl) {
      return setErrorMessage('Please attach the main product source code (.zip file).');
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('slug', toSlug(slug));
    formData.append('description', description.trim());
    if (categoryId) formData.append('category_id', categoryId);
    formData.append('regular_price', String(parsedRegular));
    formData.append('extended_price', String(parsedExtended));
    if (discountPrice !== '') formData.append('discount_price', String(Number(discountPrice)));
    formData.append('current_version', currentVersion.trim() || '1.0.0');
    if (livePreviewUrl.trim()) formData.append('live_preview_url', livePreviewUrl.trim());
    formData.append('status', status);
    formData.append('tech_stack', JSON.stringify(techStack));

    if (coverFile) formData.append('thumbnail', coverFile.file);
    galleryFiles.forEach((item) => formData.append('gallery', item.file));
    if (removedGalleryIds.length > 0) {
      formData.append('removed_gallery_ids', JSON.stringify(removedGalleryIds));
    }
    if (sourceZipFile) formData.append('file_source', sourceZipFile);

    setSubmitting(true);
    setUploadProgress(0);
    try {
      if (isEditMode && id) {
        await updateProduct(id, formData, setUploadProgress);
        setSuccessMessage('Product updated successfully.');
      } else {
        await createProduct(formData, setUploadProgress);
        setSuccessMessage('Product published to Themavia Market.');
        setTimeout(() => navigate('/admin/products'), 900);
      }
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title={isEditMode ? 'Edit Digital Product' : 'Upload New Product'}
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Products', to: '/admin/products' },
        { label: isEditMode ? 'Edit' : 'Upload Product' },
      ]}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      {loadingInitial ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
          <div className="h-6 w-56 rounded bg-slate-100 animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-32 w-full rounded-xl bg-slate-100 animate-pulse" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {errorMessage && <AlertBanner variant="error" message={errorMessage} />}
          {successMessage && <AlertBanner variant="success" message={successMessage} />}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-6">
              <ProductInfoFormSection
                title={title}
                slug={slug}
                slugManuallyEdited={slugManuallyEdited}
                categoryId={categoryId}
                description={description}
                categories={categories}
                onTitleChange={handleTitleChange}
                onSlugChange={(next) => {
                  setSlugManuallyEdited(true);
                  setSlug(next);
                }}
                onSyncSlugFromTitle={() => {
                  setSlugManuallyEdited(false);
                  setSlug(toSlug(title));
                }}
                onCategoryChange={setCategoryId}
                onDescriptionChange={setDescription}
              />

              <ProductPricingFormSection
                regularPrice={regularPrice}
                extendedPrice={extendedPrice}
                discountPrice={discountPrice}
                currentVersion={currentVersion}
                status={status}
                livePreviewUrl={livePreviewUrl}
                techStack={techStack}
                disabled={submitting}
                onRegularPriceChange={setRegularPrice}
                onExtendedPriceChange={setExtendedPrice}
                onDiscountPriceChange={setDiscountPrice}
                onCurrentVersionChange={setCurrentVersion}
                onStatusChange={setStatus}
                onLivePreviewUrlChange={setLivePreviewUrl}
                onTechStackChange={setTechStack}
              />

              <ProductGalleryUploadSection
                galleryFiles={galleryFiles}
                existingGallery={existingGallery}
                onGallerySelect={handleGallerySelect}
                onRemoveGalleryItem={handleRemoveGalleryItem}
                onRemoveExistingGalleryItem={(galleryId) => {
                  setExistingGallery((prev) => prev.filter((item) => item.id !== galleryId));
                  setRemovedGalleryIds((prev) => [...prev, galleryId]);
                }}
              />
            </div>

            <div className="space-y-6">
              <ProductCoverUploadCard
                coverFile={coverFile}
                existingCoverUrl={existingCoverUrl}
                onCoverSelect={handleCoverSelect}
                onRemoveCover={handleRemoveCover}
              />

              <ProductSourceZipCard
                sourceZipFile={sourceZipFile}
                existingSourceUrl={existingSourceUrl}
                onSourceZipSelect={handleSourceZipSelect}
                onRemoveSourceZip={() => setSourceZipFile(null)}
              />

              <ProductPublishPanel
                isEditMode={isEditMode}
                submitting={submitting}
                uploadProgress={uploadProgress}
                totalAttachmentSize={totalAttachmentSize}
              />
            </div>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
