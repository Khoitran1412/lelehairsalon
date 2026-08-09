import type { Metadata } from 'next';
import HairCareJournal from '@/components/HairCareJournal';

export const metadata: Metadata = {
  title: 'Journal | LeLe Hair Design',
  description: 'Hair care knowledge, trends and stories behind every LeLe Hair Design.',
};

export default function JournalPage() {
  return <HairCareJournal />;
}
