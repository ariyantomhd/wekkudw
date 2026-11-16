import type { ProductCategory } from '../types/product';

const CATEGORY_TIMESTAMP = '2026-01-01T00:00:00.000Z';

export const THEMAVIA_CATEGORIES: ProductCategory[] = [
  {
    id: 'blog-cms',
    name: 'Blog & CMS',
    slug: 'blog-cms',
    parent_id: null,
    created_at: CATEGORY_TIMESTAMP,
  },
  {
    id: 'defi-web3',
    name: 'DeFi & Web3',
    slug: 'defi-web3',
    parent_id: null,
    created_at: CATEGORY_TIMESTAMP,
  },
  {
    id: 'mobile-apps',
    name: 'Mobile Apps',
    slug: 'mobile-apps',
    parent_id: null,
    created_at: CATEGORY_TIMESTAMP,
  },
  {
    id: 'ui-kits',
    name: 'UI Kits',
    slug: 'ui-kits',
    parent_id: null,
    created_at: CATEGORY_TIMESTAMP,
  },
];

const CATEGORY_LABEL_BY_ID: Record<string, string> = {
  'blog-cms': 'Blog & CMS',
  'defi-web3': 'DeFi & Web3',
  'mobile-apps': 'Mobile Apps',
  'ui-kits': 'UI Kits',
};

export function formatCategoryLabel(idOrSlug: string): string {
  if (CATEGORY_LABEL_BY_ID[idOrSlug]) {
    return CATEGORY_LABEL_BY_ID[idOrSlug];
  }
  return idOrSlug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function mergeWithDefaultCategories(
  remoteCategories: ProductCategory[],
): ProductCategory[] {
  if (!remoteCategories || remoteCategories.length === 0) {
    return THEMAVIA_CATEGORIES;
  }

  const byId = new Map<string, ProductCategory>();
  for (const cat of THEMAVIA_CATEGORIES) {
    byId.set(cat.id, cat);
  }
  for (const remote of remoteCategories) {
    if (!remote.id) continue;
    byId.set(remote.id, {
      ...remote,
      name: remote.name || formatCategoryLabel(remote.id),
      slug: remote.slug || remote.id,
    });
  }
  return Array.from(byId.values());
}
