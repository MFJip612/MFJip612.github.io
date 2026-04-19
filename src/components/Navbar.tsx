import { Link } from 'react-router-dom';
import { memo } from 'react';
import ModeToggle from './ModeToggle';

// 模拟页面数据
const routes = [
  { path: '/', meta: { title: 'Home', menuOrder: 0 } },
  { path: '/about', meta: { title: 'About', menuOrder: 1 } },
  { path: '/article', meta: { title: 'Articles', menuOrder: 2 } },
  { path: '/shows', meta: { title: 'Shows', menuOrder: 3 } },
  { path: '/friends', meta: { title: 'Friends', menuOrder: 4 } }
];

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-background/80 backdrop-blur-sm z-50 flex items-center px-4 shadow-md">
      <nav>
        <ul className="flex space-x-6 items-center">
          <li className="flex justify-start">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src="/favicon.svg" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </Link>
          </li>
          {routes.map((route) => (
            <li key={route.path} className="flex justify-end">
              <Link 
                to={route.path} 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded"
              >
                {route.meta.title}
              </Link>
            </li>
          ))}
          <li>
            <ModeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default memo(Navbar);