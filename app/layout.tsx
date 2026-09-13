import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { Montserrat, Inter, Space_Grotesk } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { PWAProvider } from '@/components/pwa-provider';
import { GoogleAnalytics } from '@/components/google-analytics';
import { JsonLd } from '@/components/json-ld';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsturs.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Debating Society of HSTU | Analyze, Strategize, Improvise',
    template: '%s | Debating Society of HSTU',
  },
  description:
    'Official platform of Debating Society of HSTU. Empowering future debaters, researchers, and leaders through discourse, parliamentary debate, workshops, and global collaboration.',
  keywords: [
    'Debating Society of HSTU',
    'HSTU Debating Society',
    'HSTU',
    'Hajee Mohammad Danesh Science and Technology University',
    'Debate Bangladesh',
    'Parliamentary Debate',
    'Public Speaking',
    'Undergraduate Research',
    'University Debate Society',
    'Dinajpur Debate',
    'ELSEPA',
    'STEM Debate Bangladesh',
  ],
  authors: [{ name: 'Debating Society of HSTU', url: siteUrl }],
  creator: 'Debating Society of HSTU',
  publisher: 'Debating Society of HSTU',
  applicationName: 'Debating Society of HSTU',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  category: 'education',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Debating Society of HSTU | Analyze, Strategize, Improvise',
    description:
      'Official platform of Debating Society of HSTU. Empowering student speakers and debaters, organizing tournaments, and workshops.',
    siteName: 'Debating Society of HSTU',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Debating Society of HSTU Official Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debating Society of HSTU',
    description:
      'Empowering the next generation of debaters and leaders at Hajee Mohammad Danesh Science and Technology University.',
    site: '@hsturesearch',
    creator: '@hsturesearch',
    images: ['/logo.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HSTU DS',
  },
  icons: {
    icon: [
      { url: '/logo.png?v=4', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png?v=4', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png?v=4', sizes: '192x192', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  other: {
    'geo.region': 'BD-C',
    'geo.placename': 'Dinajpur',
    'geo.position': '25.6279;88.6332',
    'ICBM': '25.6279, 88.6332',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.FIREBASE_MEASUREMENT_ID;

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5TMFGK93';

  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
        {/* End Google Tag Manager */}
        <link rel="apple-touch-icon" href="/logo.png?v=4" />
        <link rel="icon" href="/logo.png?v=4" />
        <meta name="mobile-web-app-capable" content="yes" />
        <JsonLd />
      </head>
      <body suppressHydrationWarning className="antialiased font-sans overflow-x-hidden transition-colors duration-500">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={gaMeasurementId} />
        </Suspense>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20"></div>
          <Navbar />
          <main className="min-h-screen pt-[100px]">
            {children}
          </main>
          <Footer />
          <PWAProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
