import type { Metadata } from "next";
import localFont from "next/font/local";
// import "../globals.css";
import Header from "./components/Header";
import { SpotifyPlayerProvider } from "@/app/context/SpotifyPlayerContext";
import Footer from "./components/footer";
import Script from "next/script";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Quizify",
  description: "Created for music lovers by music lovers",
};

// Fetch Header Data
async function fetchHeaderData(locale: string) {
  const response = await fetch(
    `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/header`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch header data: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    pageTitle: data.properties.pageTitle,
    navigationLinks: data.properties.navigationLinks.items.map((item: any) => ({
      linkText: item.content.properties.linkText,
      linkUrl: item.content.properties.linkUrl,
    })),
  };
}

// Fetch Footer Data
async function fetchFooterData(locale: string) {
  const response = await fetch(
    `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/footer`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch footer data: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    title: data.properties.title,
    copyrightText: data.properties.copyrightText,
    cookieConsent: data.properties.cookieConsent,
    copyrightTextSmall: data.properties.copyrightTextSmall,
    socialMediaLinks: data.properties.socialMediaLinks.map((item: any) => ({
      url: item.url,
      title: item.title,
    })),
    pageLinks: data.properties.pageLinks.map((item: any) => ({
      url: item.url,
      title: item.title,
    })),
  };
} 

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = params.locale || "sv";


  const [headerData, footerData] = await Promise.all([
    fetchHeaderData(locale),
    fetchFooterData(locale),
  ]);

  return (
      <html lang={locale}>
      <head>
        <Script strategy="beforeInteractive">
          {`window.CookieTractorConfig = {
          apiKey: "96cb6880-e19a-408d-b453-19eb4a798064"
        };`}
        </Script>
        <Script
            strategy="afterInteractive"
            src="https://cdn.cookietractor.com/cookietractor.js"
            data-lang="en-US"
            data-id="efb69d19-94da-4040-bfe7-b7ca3717d3c9"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-gray`}
      >
        <SpotifyPlayerProvider>
          <Header headerData={headerData} />
          {children}
         <Footer footerData={footerData} />
        </SpotifyPlayerProvider>
      </body>
    </html>
  );
}
