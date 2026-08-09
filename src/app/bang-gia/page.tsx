import type { Metadata } from 'next';
import Pricing from '@/components/Pricing';
import siteContent from '@/data/content';

export const metadata: Metadata = {
  title: 'Pricing | LeLe Hair Design',
  description: `LeLe Hair Design service pricing at ${siteContent.contact.address.en}.`,
};

export default function PricingPage() {
  return <Pricing />;
}
