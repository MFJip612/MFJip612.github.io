import Ads from './Ads';

const Footer = () => {
  const isProd = import.meta.env.PROD;

  return (
    <>
      <img 
        className="counter hidden"
        src="https://count.getloli.com/@MFJip?name=MFJip&theme=booru-mjg&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto"
        alt=""
      />
      {isProd ? (
        <footer data-footer className="footer">
          <span className="material-symbols-outlined"> location_on </span>
          <span> 广州 </span> | 
          <span> © 2025 MFJip612 </span> |
          <a href="https://icp.gov.moe/?keyword=20229994" target="_blank" rel="noopener noreferrer">萌ICP备20229994号</a> | 
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">网站地图</a> | 
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer">RSS 订阅</a>
          <Ads />
        </footer>
      ) : (
        <footer data-footer className="footer">
          <span className="material-symbols-outlined"> location_on </span>
          <span> 广州 </span> | 
          <span> © 2025 MFJip612 </span> |
          <a href="https://icp.gov.moe/?keyword=20229994" target="_blank" rel="noopener noreferrer">萌ICP备20229994号</a>
          <Ads />
        </footer>
      )}
    </>
  );
};

export default Footer;