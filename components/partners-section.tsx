'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ExternalLink, Building2, Sparkles, Handshake } from 'lucide-react';
import { Partner, getPartners, subscribePartners } from '@/lib/db';

// Fallback partners if Firestore collection is not yet populated
const FALLBACK_PARTNERS: Partner[] = [
  {
    id: 'aci-limited',
    name: 'ACI Limited',
    category: 'Corporate Partner',
    description: 'Food and pharmacy research collaboration',
    displayInFrontend: true,
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnAMXim0w-yYzTJw5CprRZD6-UsLP4rcctkKd6b7M&usqp=CAE&s',
    websiteUrl: 'https://www.aci-bd.com/',
    order: 1,
    status: 'published',
  },
  {
    id: 'bcsir',
    name: 'BCSIR',
    category: 'Research Partner',
    description: 'Bangladesh Council of Scientific and Industrial Research',
    displayInFrontend: true,
    logoUrl: '',
    websiteUrl: 'https://bcsir.gov.bd/',
    order: 2,
    status: 'published',
  },
  {
    id: 'hstu-cse',
    name: 'HSTU CSE Club',
    category: 'Academic Partner',
    description: 'Department of Computer Science & Engineering, HSTU',
    displayInFrontend: true,
    logoUrl: '',
    websiteUrl: 'https://hstu.ac.bd/',
    order: 3,
    status: 'published',
  },
  {
    id: 'basis',
    name: 'BASIS Students Forum',
    category: 'Strategic Partner',
    description: 'Bangladesh Association of Software and Information Services',
    displayInFrontend: true,
    logoUrl: '',
    websiteUrl: 'https://basis.org.bd/',
    order: 4,
    status: 'published',
  },
  {
    id: 'ict-division',
    name: 'ICT Division Bangladesh',
    category: 'Government Partner',
    description: 'Ministry of Posts, Telecommunications and Information Technology',
    displayInFrontend: true,
    logoUrl: '',
    websiteUrl: 'https://ictd.gov.bd/',
    order: 5,
    status: 'published',
  },
];

interface PartnerCardProps {
  partner: Partner;
  isMarquee?: boolean;
}

function PartnerCard({ partner, isMarquee = false }: PartnerCardProps) {
  const [imgError, setImgError] = useState(false);
  const logo = partner.logoUrl || partner.imageUrl || partner.logo || partner.image || '';
  const url = partner.websiteUrl || partner.url || partner.link || partner.website;

  const content = (
    <div
      className={`relative group/card flex items-center gap-4 px-5 py-3.5 rounded-2xl glass transition-all duration-300 ${
        url ? 'cursor-pointer hover:border-info-light/50 hover:shadow-lg hover:-translate-y-1' : ''
      } ${isMarquee ? 'w-[280px] shrink-0' : 'w-full max-w-sm'}`}
    >
      {/* Partner Logo / Fallback Avatar */}
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800/80 p-2 shrink-0 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center relative overflow-hidden shadow-xs">
        {logo && !imgError ? (
          <Image
            src={logo}
            alt={partner.name || 'Partner logo'}
            width={48}
            height={48}
            className="w-full h-full object-contain filter group-hover/card:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-info-light bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            {partner.name ? partner.name.slice(0, 2).toUpperCase() : <Building2 className="w-5 h-5 text-info-light" />}
          </div>
        )}
      </div>

      {/* Partner Details */}
      <div className="flex flex-col min-w-0 flex-grow text-left">
        <div className="flex items-center gap-1.5">
          <h4 className="font-bold text-sm text-primary-light dark:text-primary truncate group-hover/card:text-info-light transition-colors">
            {partner.name}
          </h4>
          {url && (
            <ExternalLink className="w-3 h-3 text-primary-light/40 dark:text-primary/40 group-hover/card:text-info-light shrink-0 transition-colors" />
          )}
        </div>
        {partner.category && (
          <span className="text-[11px] font-medium text-secondary-light tracking-wide truncate">
            {partner.category}
          </span>
        )}
        {partner.description && !isMarquee && (
          <p className="text-[11px] text-primary-light/60 dark:text-primary/60 truncate mt-0.5">
            {partner.description}
          </p>
        )}
      </div>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Visit ${partner.name}`}
        className="block focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return content;
}

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>(FALLBACK_PARTNERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getPartners();
        if (isMounted && data && data.length > 0) {
          setPartners(data);
        }
      } catch (err) {
        console.warn('Error fetching partners:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    const unsubscribe = subscribePartners((updated) => {
      if (isMounted && updated && updated.length > 0) {
        setPartners(updated);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const displayPartners = partners.length > 0 ? partners : FALLBACK_PARTNERS;
  const isOverflow = displayPartners.length >= 10;

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass border-info-light/30 text-info-light text-xs font-bold uppercase tracking-wider mb-3">
            <Handshake className="w-3.5 h-3.5" />
            <span>Collaboration &amp; Network</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary-light dark:text-primary">
            Our Valued Partners &amp; Collaborators
          </h2>
          <p className="text-sm text-primary-light/60 dark:text-primary/60 mt-2">
            Working alongside industry pioneers, university chapters, and scientific institutions to expand research horizons.
          </p>
        </div>

        {/* Marquee Mode (for 10+ partners) */}
        {isOverflow ? (
          <div className="marquee-group relative w-full overflow-hidden py-4">
            {/* Left & Right gradient edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-r from-bg-light via-bg-light/80 to-transparent dark:from-background dark:via-background/80 dark:to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-l from-bg-light via-bg-light/80 to-transparent dark:from-background dark:via-background/80 dark:to-transparent z-10 pointer-events-none" />

            {/* Seamless Infinite Marquee Track (Right to Left) */}
            <div className="animate-marquee flex items-center gap-6">
              {/* Primary list */}
              {displayPartners.map((partner, idx) => (
                <PartnerCard key={`partner-primary-${partner.id || idx}`} partner={partner} isMarquee />
              ))}
              {/* Duplicate track for seamless infinite scroll */}
              {displayPartners.map((partner, idx) => (
                <PartnerCard key={`partner-dup-${partner.id || idx}`} partner={partner} isMarquee />
              ))}
            </div>
          </div>
        ) : (
          /* Grid / Flex Layout Mode (for < 10 partners) */
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
            {displayPartners.map((partner, idx) => (
              <motion.div
                key={partner.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-xs"
              >
                <PartnerCard partner={partner} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom invitation footnote */}
        <div className="text-center mt-10">
          <p className="text-xs text-primary-light/50 dark:text-primary/50">
            Interested in partnering with HSTU Research Society?{' '}
            <a
              href="/contact"
              className="text-info-light font-semibold hover:underline inline-flex items-center gap-1"
            >
              Get in touch with us <Sparkles className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
