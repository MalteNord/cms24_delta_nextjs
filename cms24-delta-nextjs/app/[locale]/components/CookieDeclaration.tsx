'use client'

import { useEffect } from "react";

interface Props {
    locale: string;
}

const CookieDeclaration = ({ locale = 'sv' }: Props) => {
    useEffect(() => {
        const script = document.createElement('script');
        script.id = 'CookieDeclaration';
        script.src = `https://consent.cookiebot.com/58b647b2-3fa9-4102-9136-1ab1f33c7755/cd.js`;
        script.async = true;
        script.setAttribute('data-culture', locale);

        const container = document.getElementById('cookie-declaration-container');
        if (container) {
            container.appendChild(script);
        }

        return () => {
            if (container && script.parentNode) {
                container.removeChild(script);
            }
        };
    }, [locale]);

    return <div id="cookie-declaration-container" className="text-zinc-300" />;
};

export default CookieDeclaration;