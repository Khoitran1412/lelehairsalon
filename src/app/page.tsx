import About from '@/components/BrandIntro';
import BookingSection from '@/components/BookingSection';
import Contact from '@/components/Contact';
import CustomerGallery from '@/components/CustomerGallery';
import FeaturedServices from '@/components/FeaturedServices';
import Hero from '@/components/Hero';
import PricingPreview from '@/components/PricingPreview';
import ReviewsSection from '@/components/ReviewsSection';
import SignatureStyles from '@/components/SignatureStyles';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <PricingPreview />
      <SignatureStyles />
      <CustomerGallery />
      <About />
      <ReviewsSection variant="preview" />
      <BookingSection />
      <Contact />
    </>
  );
}
