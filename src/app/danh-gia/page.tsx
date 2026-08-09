import type { Metadata } from 'next';
import BookingSection from '@/components/BookingSection';
import ReviewsSection from '@/components/ReviewsSection';

export const metadata: Metadata = {
  title: 'Customer Reviews | LeLe Hair Design',
  description: 'Explore verified client reviews for LeLe Hair Design.',
};

export default function ReviewsPage() {
  return (
    <>
      <ReviewsSection variant="full" />
      <BookingSection />
    </>
  );
}
