import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RevealTitle({ as: Tag = 'h2', className = '', children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(element.querySelector('[data-reveal-copy]'),
        { yPercent: 108, opacity: 0, rotate: 1.5 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
    }, element);
    return () => context.revert();
  }, []);

  return <Tag ref={ref} className={`ba-reveal-title ${className}`}><span data-reveal-copy>{children}</span></Tag>;
}
