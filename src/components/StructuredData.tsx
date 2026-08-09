import siteContent from '@/data/content';

export default function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: siteContent.brand.name,
    description: siteContent.seo.description,
    telephone: siteContent.contact.phoneHref.replace('tel:', ''),
    address: {
      '@type': 'PostalAddress',
      ...siteContent.contact.structuredAddress,
    },
    hasMap: siteContent.contact.googleMapsUrl,
    sameAs: [siteContent.contact.instagramUrl, siteContent.contact.facebookUrl],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
