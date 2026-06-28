export interface ArticleMeta {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export interface PageMeta {
  title?: string;
  menuOrder?: number;
  hidden?: boolean;
  [key: string]: any;
}

export interface RouteInfo {
  path: string;
  name: string;
  component: any;
  meta: ArticleMeta | PageMeta;
}