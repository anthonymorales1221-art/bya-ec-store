import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollStatement({ children }) {
  const ref = useRef(null);
  const words = String(children).split(' ');
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      gsap.to(element.querySelectorAll('span'), {
        color: 'var(--ba-navy-deep)',
        stagger: 0.08,
        scrollTrigger: { trigger: element, start: 'top 82%', end: 'bottom 48%', scrub: 0.7 },
      });
    }, element);
    return () => context.revert();
  }, []);
  return <p ref={ref} className="ba-scroll-statement" aria-label={children}>{words.map((word, index) => <span aria-hidden="true" key={`${word}-${index}`}>{word} </span>)}</p>;
}
