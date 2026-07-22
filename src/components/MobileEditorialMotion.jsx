import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function MobileEditorialMotion() {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const reveal = (trigger, items, options = {}) => {
          if (!trigger || items.length === 0) return;
          ScrollTrigger.create({
            trigger,
            start: options.start || 'top 86%',
            once: true,
            onEnter: () => gsap.fromTo(items, {
              y: options.y || 24,
              opacity: options.opacity || 0.55,
              scale: options.scale || 1,
            }, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: options.duration || 0.65,
              stagger: options.stagger || 0.08,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            }),
          });
        };

        const trust = document.querySelector('.ba-trust-strip');
        reveal(trust, trust ? [trust] : [], { y: 18, opacity: 0.72, duration: 0.55, start: 'top 96%' });

        const statement = document.querySelector('.ba-statement-panel');
        reveal(statement, statement ? [...statement.children] : [], { y: 22, duration: 0.62 });

        const story = document.querySelector('.ba-story');
        if (story) {
          reveal(story, [...story.querySelectorAll('.ba-story-lead > *')], { y: 22 });
          story.querySelectorAll('.ba-story-step').forEach((step) => {
            reveal(step, [...step.children], { y: 20, duration: 0.58, stagger: 0.07 });
          });
        }

        const buying = document.querySelector('.ba-buying');
        if (buying) {
          reveal(buying, [...buying.querySelectorAll('.ba-buying-heading > *')], { y: 22 });
          buying.querySelectorAll('.ba-buying-step').forEach((step) => {
            reveal(step, [...step.children], { y: 20, duration: 0.58, stagger: 0.07 });
          });
        }

        const faq = document.querySelector('.ba-faq');
        if (faq) {
          reveal(faq, [...faq.querySelectorAll('.ba-faq-heading > *')], { y: 20 });
          reveal(faq.querySelector('.ba-faq-list'), [...faq.querySelectorAll('.ba-faq-item')], { y: 18, duration: 0.52, stagger: 0.06, start: 'top 90%' });
        }
      });
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  return null;
}
