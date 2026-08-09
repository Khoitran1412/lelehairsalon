import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import Footer from '@/components/Footer';
import { BookingProvider } from '@/components/BookingProvider';
import Header from '@/components/Header';
import { MobileMenuProvider } from '@/components/MobileMenuProvider';
import MobileBookingButton from '@/components/MobileBookingButton';
import StructuredData from '@/components/StructuredData';
import siteContent from '@/data/content';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: siteContent.seo.title,
  description: siteContent.seo.description,
  keywords: siteContent.seo.keywords,
  openGraph: {
    title: siteContent.seo.title,
    description: siteContent.seo.description,
    type: 'website',
    locale: 'en_US',
    siteName: siteContent.brand.name,
  },
  icons: { icon: '/favicon.svg' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.variable} ${beVietnamPro.variable} grain-overlay`}>
        <StructuredData />
        <LanguageProvider>
          <BookingProvider>
            <MobileMenuProvider>
              <Header />
              <main className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
              <Footer />
              <MobileBookingButton />
            </MobileMenuProvider>
          </BookingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
