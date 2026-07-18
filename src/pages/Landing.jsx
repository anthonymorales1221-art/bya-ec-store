import { useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import Hero from '../components/Hero';
import StorySection from '../components/StorySection';
import Categories from '../components/Categories';
import Testimonials from '../components/Testimonials';
import Evidencias from '../components/Evidencias';
import TransitionCTA from '../components/TransitionCTA';
import { useScrollAnimationsCleanup } from '../hooks/useScrollAnimations';

export default function Landing() {
  useScrollAnimationsCleanup();

  useEffect(() => {
    document.title = 'B&A.Ec Store — Importados con intención, en Ambato';
  }, []);

  return (
    <div className="relative">
      <AnimatedBackground />
      <Hero />
      <StorySection />
      <Categories />
      <Testimonials />
      <Evidencias />
      <TransitionCTA />
    </div>
  );
}
