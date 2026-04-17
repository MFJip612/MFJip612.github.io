import { useEffect } from 'react';

interface AdsProps {
  adSlot?: string;
  adFormat?: string;
  adStyle?: string | React.CSSProperties;
}

// 扩展Window接口
interface WindowWithAds extends Window {
  adsbygoogle?: any[];
}

declare const window: WindowWithAds;

const Ads: React.FC<AdsProps> = ({
  adSlot = '0000000000',
  adFormat = 'auto',
  adStyle = { display: 'block' }
}) => {
  useEffect(() => {
    // 加载AdSense脚本
    if (typeof window !== 'undefined') {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, []);

  return (
    <ins 
      className="adsbygoogle" 
      data-ad-client="ca-pub-3433477986485987" 
      data-ad-slot={adSlot} 
      data-ad-format={adFormat}
      style={adStyle as React.CSSProperties}
    ></ins>
  );
};

export default Ads;