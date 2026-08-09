import type { Metadata } from 'next';
import Portfolio from '@/components/Portfolio';

export const metadata: Metadata = {
  title: 'Portfolio | LeLe Hair Design',
  description:
    'Explore hair designs at LeLe Hair Design, including Layer, Bob, Curl, Color, Wolfcut and transformations.',
};

export default function PortfolioPage() {
  return <Portfolio />;
}
