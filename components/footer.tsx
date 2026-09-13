'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Youtube, Twitter, Github, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getFooterInfo, subscribeFooterInfo, FooterInfo, DEFAULT_FOOTER_INFO } from '@/lib/db';

const defaultQuickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about/leadership/executive' },
  { label: 'Gallery', href: '/content/gallery' },
  { label: 'Events', href: '/events/upcoming' },
  { label: 'Contact', href: '/contact' },
];

const defaultResourceLinks = [
  { label: 'Constitution', href: '/about/constitution' },
  { label: 'History', href: '/about/history' },
  { label: 'Magazine', href: '/content/magazine' },
  { label: 'Certificate Verification', href: '/verification/certificate' },
  { label: 'FAQ', href: '/contact/faq' },
];

export function Footer() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo>(DEFAULT_FOOTER_INFO);

  useEffect(() => {
    let isMounted = true;

    async function loadFooter() {
      try {
        const data = await getFooterInfo();
        if (isMounted && data) {
          setFooterInfo(data);
        }
      } catch (err) {
        console.warn('Failed to fetch footer info from Firestore:', err);
      }
    }

    loadFooter();

    const unsub = subscribeFooterInfo((updatedData) => {
      if (isMounted && updatedData) {
        setFooterInfo((prev) => ({ ...prev, ...updatedData }));
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const siteName = footerInfo.siteName || DEFAULT_FOOTER_INFO.siteName || 'Debating Society of HSTU';
  const description =
    footerInfo.description ||
    footerInfo.tagline ||
    DEFAULT_FOOTER_INFO.description!;

  const address =
    footerInfo.address ||
    footerInfo.location ||
    DEFAULT_FOOTER_INFO.address!;

  const email = footerInfo.email || DEFAULT_FOOTER_INFO.email!;
  const phone = footerInfo.phone || DEFAULT_FOOTER_INFO.phone;

  const newsletterUrl = footerInfo.newsletterUrl || DEFAULT_FOOTER_INFO.newsletterUrl!;
  const newsletterLabel = footerInfo.newsletterLabel || DEFAULT_FOOTER_INFO.newsletterLabel!;

  const copyrightText =
    footerInfo.copyrightText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;

  const quickLinks = footerInfo.quickLinks && footerInfo.quickLinks.length > 0 ? footerInfo.quickLinks : defaultQuickLinks;
  const resourceLinks = footerInfo.resourceLinks && footerInfo.resourceLinks.length > 0 ? footerInfo.resourceLinks : defaultResourceLinks;

  const facebookUrl = footerInfo.facebookUrl || DEFAULT_FOOTER_INFO.facebookUrl!;
  const instagramUrl = footerInfo.instagramUrl || DEFAULT_FOOTER_INFO.instagramUrl!;
  const linkedinUrl = footerInfo.linkedinUrl || DEFAULT_FOOTER_INFO.linkedinUrl!;
  const youtubeUrl = footerInfo.youtubeUrl || DEFAULT_FOOTER_INFO.youtubeUrl!;

  const socialLinks = [
    { icon: Facebook, href: facebookUrl, label: 'Facebook' },
    { icon: Instagram, href: instagramUrl, label: 'Instagram' },
    { icon: Linkedin, href: linkedinUrl, label: 'LinkedIn' },
    { icon: Youtube, href: youtubeUrl, label: 'YouTube' },
    ...(footerInfo.twitterUrl ? [{ icon: Twitter, href: footerInfo.twitterUrl, label: 'Twitter' }] : []),
    ...(footerInfo.githubUrl ? [{ icon: Github, href: footerInfo.githubUrl, label: 'GitHub' }] : []),
  ];

  return (
    <footer className="mt-24 pt-16 pb-8 border-t border-black/5 dark:border-white/10 glass rounded-t-[40px] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 flex items-center justify-center relative rounded-xl overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt={`${siteName} Logo`} 
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-xl tracking-tight">{siteName}</span>
            </div>
            <p className="text-primary-light/70 dark:text-primary/70 max-w-xs leading-relaxed whitespace-pre-line">
              {description}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {socialLinks.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  whileHover={{ scale: 1.1, rotate: 12, y: -2 }}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-info-light hover:border-info-light/40 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg mb-2">Quick Links</h4>
            {quickLinks.map((item) => (
              <Link key={item.label} href={item.href} className="text-primary-light/70 dark:text-primary/70 hover:text-info-light transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[2px] bg-info-light transition-all duration-300 group-hover:w-4"></span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg mb-2">Resources</h4>
            {resourceLinks.map((item) => (
              <Link key={item.label} href={item.href} className="text-primary-light/70 dark:text-primary/70 hover:text-info-light transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[2px] bg-info-light transition-all duration-300 group-hover:w-4"></span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg mb-2">Contact Info</h4>
            <div className="flex items-start gap-3 text-primary-light/70 dark:text-primary/70">
              <MapPin className="w-5 h-5 shrink-0 mt-1 text-info-light" />
              <p className="whitespace-pre-line">{address}</p>
            </div>
            <div className="flex items-center gap-3 text-primary-light/70 dark:text-primary/70 mt-1">
              <Mail className="w-5 h-5 shrink-0 text-info-light" />
              <a href={`mailto:${email}`} className="hover:text-info-light transition-colors break-all">
                {email}
              </a>
            </div>
            {phone && (
              <div className="flex items-center gap-3 text-primary-light/70 dark:text-primary/70 mt-1">
                <Phone className="w-5 h-5 shrink-0 text-info-light" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-info-light transition-colors">
                  {phone}
                </a>
              </div>
            )}
            <motion.a 
              href={newsletterUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 flex items-center justify-between px-6 py-4 glass rounded-2xl hover:bg-white/80 dark:hover:bg-white/15 transition-colors cursor-pointer group"
            >
              <span className="font-semibold text-sm group-hover:text-info-light transition-colors">{newsletterLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-black/5 dark:border-white/10 gap-4 text-sm text-primary-light/60 dark:text-primary/60">
          <p>{copyrightText}</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-info-light transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-info-light transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
