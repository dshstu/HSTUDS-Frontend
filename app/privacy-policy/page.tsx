'use client';

import { PageHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import { getPrivacyPolicy, subscribeStaticPage } from '@/lib/db';
import { LatexRenderer } from '@/components/latex-renderer';

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await getPrivacyPolicy();
      if (isMounted) {
        if (data) setContent(data);
        setLoading(false);
      }
    }
    load();

    const unsub = subscribeStaticPage(
      ["privacy_policy", "privacy", "privacypolicy", "privacy-policy", "policy"],
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
        title="Privacy Policy" 
        description="Learn how Debating Society of HSTU collects, protects, and respects your personal information."
      />
      
      <div className="glass rounded-[36px] p-8 md:p-12 prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-info-light">
        {loading ? (
          <div className="text-center py-8 text-primary-light/60 dark:text-primary/60">Loading privacy policy...</div>
        ) : content?.contentMarkdown ? (
          <LatexRenderer content={content.contentMarkdown} />
        ) : (
          <>
            <h2>1. Overview &amp; Commitment</h2>
            <p>
              The <strong>Debating Society of HSTU</strong> is committed to safeguarding the privacy and personal data of our members, 
              event attendees, newsletter subscribers, and website visitors. This Privacy Policy details how we gather, utilize, and protect your information.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect information you voluntarily provide through our forms, registration workflows, and portal features, including:</p>
            <ul>
              <li><strong>Contact Information:</strong> Full name, university email address, phone number, and physical department details.</li>
              <li><strong>Academic &amp; Membership Data:</strong> Student ID, academic batch, session, blood group, and society leadership designations.</li>
              <li><strong>Event &amp; Form Submissions:</strong> Feedback responses, workshop registrations, newsletter sign-ups, and competition entries.</li>
              <li><strong>Verification Credentials:</strong> Digital certificate records and verified membership IDs.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>Your data is used strictly for legitimate research, educational, and society purposes, including:</p>
            <ul>
              <li>Facilitating official society communications, newsletters, and announcements.</li>
              <li>Managing event registrations, logistics, and digital certificate verification.</li>
              <li>Maintaining authenticated leadership records and student alumni rosters.</li>
              <li>Improving website performance, security, and member resource accessibility.</li>
            </ul>

            <h2>4. Data Sharing &amp; Third Parties</h2>
            <p>
              We do <strong>not</strong> sell, trade, or rent personal identifiable information to third parties. Data is only processed through 
              trusted educational tools (e.g., Google Forms, Firebase) or shared with university administration when explicitly required for 
              academic verification or emergency safety.
            </p>

            <h2>5. Data Security &amp; Retention</h2>
            <p>
              We implement industry-standard technical measures to protect against unauthorized access, alteration, or disclosure of your personal information. 
              Data is retained only as long as necessary to maintain valid membership records and historical verification registries.
            </p>

            <h2>6. Your Privacy Rights</h2>
            <p>
              Members and participants have the right to review, update, or request the removal of their personal details from public registries 
              (such as website leadership or member spotlights) at any time by contacting the society executives.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, please contact us at 
              <a href="mailto:hstu.rs@gmail.com" className="ml-1">hstu.rs@gmail.com</a> 
              or visit our office in the Dr. Muhammad Qudrat-I-Khuda Academic Building.
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
