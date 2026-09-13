// components/json-ld.tsx
import React from 'react';
import { DEFAULT_FOOTER_INFO } from '@/lib/db';

export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsturs.org';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Debating Society of HSTU',
    alternateName: ['HSTU Debating Society', 'Hajee Mohammad Danesh Science and Technology University Debating Society'],
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/logo.png`,
    description: 'Debating Society of HSTU is a premier student-driven debating and public speaking community empowering students and scholars.',
    email: DEFAULT_FOOTER_INFO.email,
    telephone: DEFAULT_FOOTER_INFO.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'TSC, HSTU',
      addressLocality: 'Dinajpur',
      postalCode: '5200',
      addressCountry: 'BD',
    },
    sameAs: [
      DEFAULT_FOOTER_INFO.facebookUrl,
      DEFAULT_FOOTER_INFO.instagramUrl,
      DEFAULT_FOOTER_INFO.linkedinUrl,
      DEFAULT_FOOTER_INFO.youtubeUrl,
    ].filter(Boolean),
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Hajee Mohammad Danesh Science and Technology University',
      alternateName: 'HSTU',
      url: 'https://hstu.ac.bd',
    },
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Debating Society of HSTU',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
