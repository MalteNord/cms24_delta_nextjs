"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from 'next/link';

interface NotFoundData {
  properties: {
    title: string;
    description: string;
    icon: Array<{ url: string }>;
    buttonText: string;
  };
}

const NotFoundContent = () => {
  const pathname = usePathname();
  const [content, setContent] = useState<NotFoundData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locale = pathname.split("/")[1] || "sv";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(
          `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/notfound`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: NotFoundData = await res.json();
        setContent(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Error fetching data!");
      }
    };

    fetchContent();
  }, [locale]);

  if (!content && !error) {
    return <h1 className="text-white">Loading...</h1>;
  }

  if (error) {
    return <h1 className="text-white">{error}</h1>;
  }

  const { title, description, buttonText } = content!.properties;
  

  return (
    <div className="flex flex-col items-center justify-center py-24 bg-stone-900 min-h-screen">
      <h1 className="font-bold text-4xl text-white mb-4">{title}</h1>
      <p className="font-bold text-lg text-white mb-6 text-center">{description}</p>
      <Link href={`/${locale}`} className="px-6 py-3 bg-green-mid text-white rounded-md hover:bg-green-dark transition text-center">
        {buttonText}
      </Link>
    </div>
  );
};

export default NotFoundContent;
