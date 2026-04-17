import { site } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: site.url }],
  creator: site.author,
  publisher: site.author,
  keywords: [
    "Pavan Koka",
    "frontend engineer",
    "WebGL",
    "React",
    "Next.js",
    "Vue",
    "performance",
    "layout thrashing",
    "real-time",
    "Three.js",
  ],
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    creator: site.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en-US",
      publisher: { "@id": `${site.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.author,
      url: site.url,
      email: site.email,
      jobTitle: "Senior Software Engineer (Frontend)",
      sameAs: [site.links.linkedin, site.links.github],
    },
    {
      "@type": "ItemList",
      "@id": `${site.url}/#labs`,
      name: "Interactive performance labs",
      itemListElement: site.labs.map((lab, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: lab.title,
        url: lab.href,
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="dns-prefetch" href="https://react-re-render.vercel.app" />
        <link
          rel="dns-prefetch"
          href="https://react-props-children-demo-nine.vercel.app"
        />
        <link
          rel="dns-prefetch"
          href="https://layout-thrashing-demo.vercel.app"
        />
        <link
          rel="dns-prefetch"
          href="https://gpu-vs-cpu-animations.vercel.app"
        />
      </head>
      <body className="min-h-screen overflow-x-hidden font-[family-name:var(--font-display)] antialiased">
        {children}
      </body>
    </html>
  );
}
