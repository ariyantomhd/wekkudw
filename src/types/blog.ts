// src/types/blog.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  badge_color?: string;
  count?: number;
}

export interface Comment {
  id: number;
  article_id: number;
  name: string;
  text: string;
  created_at: string;
}

export interface Article {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string[];
  category_id?: number;
  category?: string;
  author?: string;
  image_url?: string;
  is_featured?: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
}

export interface CreateCommentDTO {
  name: string;
  text: string;
}
