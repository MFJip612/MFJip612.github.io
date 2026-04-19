import { lazy } from 'react';
import type { ReactNode } from 'react';


// 定义路由类型
export interface RouteConfig {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
}

// 懒加载组件
const Home = lazy(() => import('../views/Home'));
const About = lazy(() => import('../views/About'));
const Article = lazy(() => import('../views/Article'));
const Shows = lazy(() => import('../views/Shows'));
const Friends = lazy(() => import('../views/Friends'));

// 路由配置
export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/about',
    element: <About />
  },
  {
    path: '/article',
    element: <Article />
  },
  {
    path: '/article/:id',
    element: <Article />
  },
  {
    path: '/shows',
    element: <Shows />
  },
  {
    path: '/friends',
    element: <Friends />
  }
];
