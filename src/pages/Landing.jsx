import { useEffect } from 'react';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import StorySection from '../components/StorySection';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import BuyingJourney from '../components/BuyingJourney';
import DeliveryPayments from '../components/DeliveryPayments';
import Testimonials from '../components/Testimonials';
import Evidencias from '../components/Evidencias';
import AfterSales from '../components/AfterSales';
import PremiumFaq from '../components/PremiumFaq';
import ImmersiveCTA from '../components/ImmersiveCTA';
import PremiumCursor from '../components/PremiumCursor';
import TitleRevealManager from '../components/TitleRevealManager';
import ScrollStatement from '../components/ScrollStatement';
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
      <PremiumCursor />
      <TitleRevealManager />
      <Hero />
      <TrustStrip />
      <section className="ba-statement-panel px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-[1240px]"><ScrollStatement>Seleccionamos posibilidades, no limitamos categorías.</ScrollStatement></div></section>
      <Categories />
      <StorySection />
      <FeaturedProducts />
      <BuyingJourney />
      <DeliveryPayments />
      <Testimonials />
      <Evidencias />
      <AfterSales />
      <PremiumFaq />
      <ImmersiveCTA />
    </div>
  );
}
