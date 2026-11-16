// src/types/product.ts
import { ProductStatus } from './enums';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

export interface ProductGallery {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  review_text: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  userName?: string;
  comment?: string;
  date?: string;
  likes?: number;
}

export interface ProductFileAsset {
  name: string;
  size: string;
}

export type ProductQueryParams = {
  category?: string;
  category_id?: string;
  is_featured?: boolean | string;
  is_popular?: boolean | string;
  is_flash_sale?: boolean | string;
  limit?: number | string;
  page?: number | string;
  search?: string;
  status?: ProductStatus | string;
  sort?: string;
  filter?: string;
  [key: string]: string | number | boolean | undefined;
};

export interface Product {
  id: string;
  title: string;
  slug: string;

  description: string | null;
  is_affiliate_product?: boolean;
  affiliate_external_url?: string | null;
  affiliate_platform?: string | null;
  commission_percentage?: number;

  regular_price: number;
  extended_price: number;
  discount_price: number | null;
  discount_ends_at: string | null;

  category_id: string | null;
  category?: ProductCategory | null;
  tags: string[] | null;
  tech_stack: string[] | null;
  current_version: string;
  framework_version?: string | null;

  images_url: string | null;
  live_preview_url: string | null;
  file_source_url: string;
  status: ProductStatus;

  is_featured?: boolean;
  is_popular?: boolean;
  is_flash_sale?: boolean;

  rating_avg: number;
  reviews_count: number;
  sales_count: number;
  likes_count: number;

  created_at: string;
  updated_at: string;

  gallery?: ProductGallery[];
  reviews?: ProductReview[];
}

export interface ProductChangelog {
  id: string;
  product_id: string;
  version: string;
  changes_text: string;
  released_at: string;
}

export interface ProductRelation {
  product_id: string;
  related_product_id: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProductInput = Partial<CreateProductInput>;
