'use client';

import { PageHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import { getTermsOfService, subscribeStaticPage } from '@/lib/db';
import { LatexRenderer } from '@/components/latex-renderer';

export default function TermsOfServicePage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await getTermsOfService();
      if (isMounted) {
        if (data) setContent(data);
        setLoading(false);
      }
    }
    load();

    const unsub = subscribeStaticPage(
      ["terms_of_service", "terms", "tos", "termsofservice", "terms-of-service"],
      (updatedData) => {
        if (isMounted && updatedData) {
          setContent(updatedData);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-4xl pb-24">
      <PageHeader 
        title="Terms of Service" 
        description="Please review the terms and conditions governing your participation and use of Debating Society of HSTU resources."
      />
      
      <div className="glass rounded-[36px] p-8 md:p-12 prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-info-light">
        {loading ? (
          <div className="text-center py-8 text-primary-light/60 dark:text-primary/60">Loading terms...</div>
        ) : content?.contentMarkdown ? (
          <LatexRenderer content={content.contentMarkdown} />
        ) : (
          <>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing the official website, participating in events, or utilizing resources provided by the 
              <strong> Debating Society of HSTU</strong>, you agree to adhere to and be bound by these Terms of Service. 
              If you do not agree with any portion of these terms, you should refrain from using our online platforms and services.
            </p>

            <h2>2. Membership &amp; Code of Conduct</h2>
            <p>
              All members and participants are expected to maintain the highest standards of integrity, professional ethics, and mutual respect. 
              Harassment, discrimination, academic dishonesty, and unauthorized commercial exploitation of society activities or materials are strictly prohibited.
            </p>
            <ul>
              <li>Members must provide accurate information during registration and verification processes.</li>
              <li>Official credentials and membership badges are non-transferable.</li>
              <li>Participation in research projects requires compliance with ethical standards and intellectual integrity.</li>
            </ul>

            <h2>3. Intellectual Property &amp; Publications</h2>
            <p>
              All original content, magazines, event media, research articles, logos, and digital publications displayed on this platform are 
              the property of the Debating Society of HSTU or their respective authors. Content may be downloaded or referenced for personal, academic, 
              and non-commercial use with appropriate citation and credit.
            </p>

            <h2>4. Event Registrations &amp; Certificates</h2>
            <p>
              Certificates of completion, achievement, or participation issued by the society are verified through our digital verification portal. 
              Any attempt to falsify, duplicate, or tamper with official certificates, membership IDs, or verification records will result in 
              immediate revocation of membership and report to university disciplinary committees.
            </p>

            <h2>5. Disclaimer of Liability</h2>
            <p>
              The Debating Society of HSTU provides educational materials, event announcements, and resources on an &ldquo;as is&rdquo; basis. 
              While we strive for accuracy, the society makes no warranties regarding the complete precision or applicability of materials for specific commercial applications.
            </p>

            <h2>6. Amendments &amp; Contact</h2>
            <p>
              The Executive Committee reserves the right to update these terms as needed to reflect organizational policies or university regulations. 
              Continued involvement with the society constitutes acceptance of any revised terms.
            </p>
            <p>
              For inquiries regarding these Terms of Service, please reach out via our contact page or email 
              <a href="mailto:hstu.rs@gmail.com" className="ml-1">hstu.rs@gmail.com</a>.
            </p>

            <hr />
            <p className="text-sm text-primary-light/60 dark:text-primary/60 text-center mt-8">
              Effective Date: January 2025 • Debating Society of HSTU
            </p>
          </>
        )}
      </div>
    </div>
  );
}
