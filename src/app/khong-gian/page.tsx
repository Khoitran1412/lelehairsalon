import type { Metadata } from 'next';
import Space from '@/components/Space';
import siteContent from '@/data/content';

export const metadata: Metadata = {
  title: 'The Space | LeLe Hair Design',
  description: `Discover the LeLe Hair Design space at ${siteContent.contact.address.en}.`,
};

export default function SpacePage() {
  return <Space />;
}
