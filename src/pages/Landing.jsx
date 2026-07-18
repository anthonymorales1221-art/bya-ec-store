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
      <Hero />
      <TrustStrip />
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
