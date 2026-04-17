import { useState, useEffect, useRef } from 'react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (observerTimerRef.current) {
      clearTimeout(observerTimerRef.current);
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!headings.length) return;

    // 等待 DOM 更新后再观察
    observerTimerRef.current = setTimeout(() => {
      const elements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      if (!elements.length) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // 找到最靠近顶部的可见标题
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        {
          rootMargin: "-10% 0px -80% 0px",
          threshold: 0,
        }
      );

      elements.forEach((el) => observerRef.current?.observe(el));
    }, 300);

    return () => {
      if (observerTimerRef.current) {
        clearTimeout(observerTimerRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  return (
    <nav className="toc" aria-label="目录">
      <p className="toc-title">目录</p>
      {headings.length > 0 ? (
        <ul>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`toc-item toc-level-${heading.level} ${activeId === heading.id ? 'toc-active' : ''}`}
            >
              <a 
                href={`#${heading.id}`} 
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="toc-empty">暂无目录</p>
      )}
    </nav>
  );
};

export default TableOfContents;