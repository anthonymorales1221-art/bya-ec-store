import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TitleRevealManager() {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const titles = [...document.querySelectorAll('main h2')]
      .filter((title) => !title.classList.contains('ba-reveal-title') && !title.classList.contains('visually-hidden'));
    const originals = titles.map((title) => [title, title.innerHTML]);
    const context = gsap.context(() => {
      titles.forEach((title) => {
        const textNodes = [...title.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        textNodes.forEach((node) => {
          const fragment = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach((word) => {
            if (!word.trim()) return fragment.appendChild(document.createTextNode(word));
            const clip = document.createElement('span');
            const copy = document.createElement('span');
            clip.className = 'ba-reveal-word';
            copy.textContent = word;
            clip.appendChild(copy);
            fragment.appendChild(clip);
          });
          node.replaceWith(fragment);
        });
        const words = title.querySelectorAll('.ba-reveal-word > span');
        if (!words.length) return;
        gsap.fromTo(words, { yPercent: 108, opacity: 0 }, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.035,
          ease: 'expo.out',
          scrollTrigger: { trigger: title, start: 'top 88%', once: true },
        });
      });
    });
    return () => {
      context.revert();
      originals.forEach(([title, html]) => { if (title.isConnected) title.innerHTML = html; });
    };
  }, []);
  return null;
}
