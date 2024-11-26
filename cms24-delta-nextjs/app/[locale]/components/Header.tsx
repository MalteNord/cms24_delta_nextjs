'use client'
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface NavigationLink {
  linkText: string;
  linkUrl: string;
}

interface HeaderData {
  pageTitle: string;
  navigationLinks: NavigationLink[];
}

export default function Header({ headerData }: { headerData: HeaderData }) {
  const { pageTitle, navigationLinks } = headerData;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = pathname.split("/")[1];
  const isGamePage = pathname.includes('/game');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${newPath}?${queryString}` : newPath;
    router.push(fullPath);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const LanguageSwitcher = () => {
    if (isGamePage) return null;

    return (
        <select
            value={currentLocale}
            onChange={(e) => handleLocaleChange(e.target.value)}
            className="ml-4 bg-stone-900 border-none hover:text-green-mid transition-colors"
        >
          <option value="sv">Svenska</option>
          <option value="en">English</option>
        </select>
    );
  };

  return (
      <header className="sticky top-0 bg-stone-900 text-white p-4 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Site Title */}
          <h1 className="inline-block text-4xl font-bold bg-gradient-to-r from-green-dark via-green-mid to-green-dark bg-clip-text text-transparent">
            {pageTitle || "Quizify"}
          </h1>

          {/* Hamburger Menu Button */}
          <button
              onClick={toggleMenu}
              className="md:hidden block text-gray-200 focus:outline-none"
              aria-label="Toggle navigation"
          >
            {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
            ) : (
                <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 items-center">
            {navigationLinks.map((link, index) => (
                <a
                    key={index}
                    href={link.linkUrl}
                    className={`hover:text-green-mid transition-colors ${
                        pathname === link.linkUrl ? "text-green-mid font-bold" : ""
                    }`}
                >
                  {link.linkText}
                </a>
            ))}
            <LanguageSwitcher />
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
            <nav className="md:hidden absolute top-full left-0 right-0 bg-stone-900 flex flex-col items-center space-y-4 py-4">
              {navigationLinks.map((link, index) => (
                  <a
                      key={index}
                      href={link.linkUrl}
                      className="hover:text-green-mid transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                  >
                    {link.linkText}
                  </a>
              ))}
              {/* Language Switcher for Mobile */}
              {!isGamePage && (
                  <select
                      value={currentLocale}
                      onChange={(e) => {
                        handleLocaleChange(e.target.value);
                        setIsMenuOpen(false);
                      }}
                      className="bg-stone-900 border-none hover:text-green-mid transition-colors"
                  >
                    <option value="sv">Svenska</option>
                    <option value="en">English</option>
                  </select>
              )}
            </nav>
        )}
      </header>
  );
}