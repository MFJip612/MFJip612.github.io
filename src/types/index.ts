export interface ArticleMeta {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  menuOrder?: number;
  hidden?: boolean;
}

export interface PageMeta {
  title: string;
  description?: string;
  menuOrder?: number;
  hidden?: boolean;
}