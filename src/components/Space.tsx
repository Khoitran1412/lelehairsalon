'use client';

import Image from 'next/image';
import siteContent from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import BackToHome from './BackToHome';
import { BookingTrigger } from './BookingProvider';
import ScrollReveal from './ScrollReveal';

export default function Space() {
  const { language, t } = useLanguage();
  const [primaryImage, ...supportingImages] = siteContent.spaceImages;

  return (
    <section className="section-padding bg-ivory" aria-labelledby="space-title">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-20">
          <div>
            <ScrollReveal>
              <p className="section-label">{t.space.eyebrow}</p>
              <h1 id="space-title" className="section-heading mb-8">{t.space.heading}</h1>
            </ScrollReveal>
            <div className="max-w-md space-y-5 font-body leading-relaxed text-charcoal/70">
              <ScrollReveal delay={1}>
                <p>{t.space.description}</p>
              </ScrollReveal>
              <ScrollReveal delay={2}>
                <BackToHome />
              </ScrollReveal>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-5">
            <ScrollReveal className="col-span-2">
              <div className="relative aspect-[16/10] overflow-hidden bg-beige/30">
                <Image src={primaryImage.image} alt={t.space.imageAlts[0]} fill sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover object-center" />
              </div>
            </ScrollReveal>
            {supportingImages.map((image, index) => (
              <ScrollReveal key={image.image} delay={((index + 1) as 1 | 2)}>
                <div className="relative aspect-[4/5] overflow-hidden bg-beige/30">
                  <Image src={image.image} alt={t.space.imageAlts[index + 1]} fill sizes="(max-width: 767px) 50vw, 28vw" className="object-cover object-center" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={2}>
          <div className="mt-14 border-t border-beige/45 pt-8 md:mt-20 md:pt-10">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <div className="relative h-[58px] w-32 overflow-hidden">
                  <Image
                    src="/logo/lele-logo.png"
                    alt="LeLe Hair Design"
                    fill
                    sizes="128px"
                    className="object-cover object-center"
                  />
                </div>
                <address className="mt-3 not-italic font-body leading-relaxed text-charcoal/65">
                  {siteContent.contact.address[language]}
                </address>
                <p className="mt-4 font-body text-charcoal/65">{siteContent.contact.phone}</p>
                <p className="mt-1 font-body text-charcoal/65">{siteContent.contact.hours}</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a href={siteContent.contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">{t.common.directions}</a>
                <a href={siteContent.contact.phoneHref} className="btn-outline">{t.common.callNow}</a>
                <BookingTrigger className="btn-primary">{t.common.bookAppointment}</BookingTrigger>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
