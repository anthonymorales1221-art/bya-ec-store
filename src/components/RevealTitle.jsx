import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RevealTitle({ as: Tag = 'h2', className = '', children, lines }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(element.querySelectorAll('[data-reveal-copy]'),
        { yPercent: 108, opacity: 0, rotate: 1.5 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
    }, element);
    return () => context.revert();
  }, []);

  const content = lines || [children];
  return <Tag ref={ref} className={`ba-reveal-title ${className}`}>{content.map((line, index) => <span className="ba-reveal-line" key={typeof line === 'string' ? line : index}><span data-reveal-copy>{line}</span></span>)}</Tag>;
}
