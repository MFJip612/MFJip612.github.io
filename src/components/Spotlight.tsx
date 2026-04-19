import { useState, useEffect, useRef } from 'react';

const animations = [
  "bounce",
  "flash",
  "pulse",
  "rubberBand",
  "shakeX",
  "shakeY",
  "headShake",
  "swing",
  "tada",
  "wobble",
  "jello",
  "heartBeat",
];

function getRandomAnimation() {
  const index = Math.floor(Math.random() * animations.length);
  return animations[index];
}

const texts = [
  "無限の進歩",
  "无限成长",
  "Infinite Growth"
];

const Spotlight = () => {
  const [text, setText] = useState("");
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const index = Math.floor(Math.random() * texts.length);
      setText(texts[index]);
    }, 3000);
  }, []);

  const RandomAnimate = () => {
    if (h1Ref.current) {
      // 移除所有动画类
      h1Ref.current.className = '';
      // 添加新的动画类
      setTimeout(() => {
        if (h1Ref.current) {
          h1Ref.current.className = `animate ${getRandomAnimation()}`;
        }
      }, 10);
    }
  };

  return (
    <div className="spotlight">
      <h1 
        data-content={text} 
        id="spotlight" 
        data-only 
        onClick={RandomAnimate}
        ref={h1Ref}
      >
        {text}
      </h1>
    </div>
  );
};

export default Spotlight;