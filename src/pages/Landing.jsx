import { useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import StorySection from '../components/StorySection';
import Categories from '../components/Categories';
import Testimonials from '../components/Testimonials';
import Evidencias from '../components/Evidencias';
import TransitionCTA from '../components/TransitionCTA';
import { useScrollAnimationsCleanup } from '../hooks/useScrollAnimations';

export default function Landing() {
  useScrollAnimationsCleanup();

  useEffect(() => {
    document.title = 'B&A.EC Store | Belleza, hogar y accesorios en Ecuador';
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', 'Descubre productos seleccionados de belleza, hogar y accesorios para vehículo. Compra con atención personalizada y envíos a todo Ecuador.');
  }, []);

  return (
    <div className="relative">
      <AnimatedBackground />
      <Hero />
      <TrustStrip />
      <StorySection />
      <Categories />
      <Testimonials />
      <Evidencias />
      <TransitionCTA />
    </div>
  );
}
