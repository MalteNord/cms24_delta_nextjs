import CookieConsentButton from "@/app/[locale]/components/CookieConsentButton";

interface NavigationLink {
  title: string;
  url: string;
}

interface FooterData {
  copyrightTextSmall: string;
  copyrightText: string;
  pageLinks: NavigationLink[];
  socialMediaLinks: NavigationLink[];
  cookieConsent: string;
}

export default function Footer({ footerData }: { footerData: FooterData }) {
  const { copyrightTextSmall, copyrightText, socialMediaLinks, pageLinks, cookieConsent } =
    footerData;

  return (
    <footer className="bg-stone-900 text-white font-bold p-4 w-full mt-72">
      <div className="flex flex-col md:flex-row justify-between items-center w-full space-y-4 md:space-y-0">
        {/* Copyright text */}
        <div className="text-sm md:text-base">
          <span className="text-zinc-500 lg:inline">{copyrightText}</span>
          <span className="text-zinc-500 inline lg:hidden">{copyrightTextSmall}</span>
        </div>

        {/* Page links (hidden on smaller screens) */}
        <div className="hidden md:flex space-x-6">
          {pageLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              rel="noopener noreferrer"
              className="text-zinc-300 hover:underline"
            >
              {link.title}
            </a>
          ))}
        </div>
        {/* Social media links */}
        <div className="flex flex-row items-center gap-x-6">
          {socialMediaLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:underline"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
