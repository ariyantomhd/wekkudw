import { formatCategoryLabel } from '../constants/categories';
import type {
  AdminDashboardStats,
  ApiResponse,
  License,
  Order,
  OrderBuyer,
  OrderDetailData,
  OrderItem,
  OrderStatus,
  PaymentGateway,
  Product,
  ProductCategory,
  ProductGallery,
  ProductStatus,
} from '../types';

type UnknownRecord = Record<string, unknown>;

function asRecord(val: unknown): UnknownRecord {
  return val && typeof val === 'object' && !Array.isArray(val)
    ? (val as UnknownRecord)
    : {};
}

function asNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val))) {
    return Number(val);
  }
  return fallback;
}

function asNullableNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string' && !Number.isNaN(Number(val))) return Number(val);
  return null;
}

function asString(val: unknown, fallback = ''): string {
  return typeof val === 'string' ? val : fallback;
}

function asNullableString(val: unknown): string | null {
  return typeof val === 'string' && val.length > 0 ? val : null;
}

function asStringArray(val: unknown): string[] | null {
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return null;
}

export function normalizeCategory(raw: unknown): ProductCategory {
  const r = asRecord(raw);
  const id = asString(r.id);
  const slug = asString(r.slug, id);
  const rawName = asString(r.name);
  return {
    id,
    name: rawName || (id ? formatCategoryLabel(id) : 'Uncategorized'),
    slug,
    parent_id: asNullableString(r.parent_id),
    created_at: asString(r.created_at, new Date().toISOString()),
  };
}

export function normalizeProduct(raw: unknown): Product {
  const r = asRecord(raw);
  const rawCategory = r.category ?? r.product_categories ?? r.categories;
  const rawGallery = r.gallery ?? r.product_gallery;

  const gallery: ProductGallery[] | undefined = Array.isArray(rawGallery)
    ? rawGallery.map((g, idx) => {
        const gr = asRecord(g);
        return {
          id: asString(gr.id, `gal_${idx}`),
          product_id: asString(gr.product_id, asString(r.id)),
          image_url: asString(gr.image_url ?? gr.url),
          alt_text: asNullableString(gr.alt_text),
          sort_order: asNumber(gr.sort_order, idx),
          created_at: asString(gr.created_at, new Date().toISOString()),
        };
      })
    : undefined;

  return {
    id: asString(r.id),
    title: asString(r.title, 'Untitled Product'),
    slug: asString(r.slug),
    description: asNullableString(r.description),
    is_affiliate_product: Boolean(r.is_affiliate_product),
    affiliate_external_url: asNullableString(r.affiliate_external_url),
    affiliate_platform: asNullableString(r.affiliate_platform),
    commission_percentage:
      r.commission_percentage !== undefined ? asNumber(r.commission_percentage) : undefined,
    regular_price: asNumber(r.regular_price, 0),
    extended_price: asNumber(r.extended_price, 0),
    discount_price: asNullableNumber(r.discount_price),
    discount_ends_at: asNullableString(r.discount_ends_at),
    category_id: asNullableString(r.category_id),
    category: rawCategory ? normalizeCategory(rawCategory) : null,
    tags: asStringArray(r.tags),
    tech_stack: asStringArray(r.tech_stack),
    current_version: asString(r.current_version, '1.0.0'),
    framework_version: asNullableString(r.framework_version),
    images_url: asNullableString(r.images_url ?? r.thumbnail_url ?? r.cover_url),
    live_preview_url: asNullableString(r.live_preview_url),
    file_source_url: asString(r.file_source_url),
    status: (asString(r.status, 'DRAFT') as ProductStatus) || 'DRAFT',
    is_featured: Boolean(r.is_featured),
    is_popular: Boolean(r.is_popular),
    is_flash_sale: Boolean(r.is_flash_sale),
    rating_avg: asNumber(r.rating_avg, 0),
    reviews_count: asNumber(r.reviews_count, 0),
    sales_count: asNumber(r.sales_count, 0),
    likes_count: asNumber(r.likes_count, 0),
    created_at: asString(r.created_at, new Date().toISOString()),
    updated_at: asString(r.updated_at, new Date().toISOString()),
    gallery,
  };
}

function normalizeBuyer(raw: unknown): OrderBuyer | null {
  const b = asRecord(raw);
  if (!b.id && !b.email && !b.username) return null;
  return {
    id: asString(b.id),
    username: asString(b.username ?? b.full_name ?? b.name) || undefined,
    email: asString(b.email),
    avatar_url: asNullableString(b.avatar_url),
  };
}

function normalizeOrderItem(raw: unknown): OrderItem {
  const r = asRecord(raw);
  const rawProduct = asRecord(r.product ?? r.products);
  const hasProduct = Boolean(rawProduct.id || rawProduct.title);

  return {
    id: asString(r.id),
    order_id: asString(r.order_id),
    product_id: asString(r.product_id),
    product_title: asString(r.product_title ?? rawProduct.title) || undefined,
    product: hasProduct
      ? {
          id: asString(rawProduct.id, asString(r.product_id)),
          title: asString(rawProduct.title, 'Digital Product'),
          slug: asString(rawProduct.slug),
          images_url: asNullableString(rawProduct.images_url ?? rawProduct.thumbnail_url),
        }
      : undefined,
    license_type: (asString(r.license_type, 'REGULAR') as OrderItem['license_type']),
    price_at_purchase: asNumber(r.price_at_purchase, 0),
    seller_fee_percentage: asNumber(r.seller_fee_percentage, 0),
    seller_fee_amount: asNumber(r.seller_fee_amount, 0),
    net_seller_earning: asNumber(r.net_seller_earning, 0),
    created_at: asString(r.created_at, new Date().toISOString()),
  };
}

export function normalizeOrder(raw: unknown): OrderDetailData {
  const r = asRecord(raw);
  const buyer = normalizeBuyer(r.buyer ?? r.users ?? r.user ?? r.profiles);
  const rawItems = r.order_items ?? r.items;
  const rawLicenses = r.licenses;

  return {
    id: asString(r.id),
    buyer_id: asString(r.buyer_id),
    buyer,
    buyer_name: asString(r.buyer_name ?? buyer?.username) || undefined,
    buyer_email: asString(r.buyer_email ?? buyer?.email) || undefined,
    invoice_number: asString(r.invoice_number, asString(r.id)),
    subtotal: asNumber(r.subtotal, 0),
    discount_total: asNumber(r.discount_total, 0),
    buyer_fee: asNumber(r.buyer_fee, 0),
    gateway_fee: asNumber(r.gateway_fee, 0),
    grand_total: asNumber(r.grand_total, 0),
    payment_gateway: (asString(r.payment_gateway, 'PAYPAL') as PaymentGateway),
    paypal_transaction_id: asNullableString(r.paypal_transaction_id),
    payment_status: (asString(r.payment_status, 'PENDING') as OrderStatus),
    affiliate_token_used: asNullableString(r.affiliate_token_used),
    created_at: asString(r.created_at, new Date().toISOString()),
    updated_at: asString(r.updated_at, new Date().toISOString()),
    order_items: Array.isArray(rawItems) ? rawItems.map(normalizeOrderItem) : undefined,
    licenses: Array.isArray(rawLicenses)
      ? (rawLicenses as License[])
      : undefined,
  };
}

export function normalizeDashboardStats(raw: unknown): AdminDashboardStats {
  const r = asRecord(raw);
  return {
    total_products: asNumber(r.total_products, 0),
    published_products:
      r.published_products !== undefined ? asNumber(r.published_products) : undefined,
    total_revenue: asNumber(r.total_revenue, 0),
    active_orders: asNumber(r.active_orders, 0),
    total_orders: r.total_orders !== undefined ? asNumber(r.total_orders) : undefined,
    pending_orders: r.pending_orders !== undefined ? asNumber(r.pending_orders) : undefined,
  };
}

export function extractArrayPayload<T>(
  rawResponse: unknown,
  normalizer: (item: unknown) => T,
): ApiResponse<T[]> {
  if (Array.isArray(rawResponse)) {
    return {
      success: true,
      data: rawResponse.map(normalizer),
    };
  }

  const envelope = asRecord(rawResponse);
  const rawData = envelope.data;

  let list: unknown[] = [];
  if (Array.isArray(rawData)) {
    list = rawData;
  } else {
    const nested = asRecord(rawData);
    const candidate = nested.items ?? nested.products ?? nested.orders ?? nested.categories ?? nested.rows;
    if (Array.isArray(candidate)) {
      list = candidate;
    }
  }

  return {
    success: typeof envelope.success === 'boolean' ? envelope.success : true,
    status_code: typeof envelope.status_code === 'number' ? envelope.status_code : undefined,
    message: typeof envelope.message === 'string' ? envelope.message : undefined,
    data: list.map(normalizer),
    pagination: envelope.pagination as ApiResponse<T[]>['pagination'],
  };
}

export function extractObjectPayload<T>(
  rawResponse: unknown,
  normalizer: (item: unknown) => T,
): ApiResponse<T> {
  const envelope = asRecord(rawResponse);
  const hasDataKey = 'data' in envelope && envelope.data !== undefined;
  const payload = hasDataKey ? envelope.data : rawResponse;

  return {
    success: typeof envelope.success === 'boolean' ? envelope.success : true,
    status_code: typeof envelope.status_code === 'number' ? envelope.status_code : undefined,
    message: typeof envelope.message === 'string' ? envelope.message : undefined,
    data: normalizer(payload),
  };
}

export function normalizeOrderSummaryList(rawOrders: unknown): Order[] {
  return Array.isArray(rawOrders) ? rawOrders.map(normalizeOrder) : [];
}
