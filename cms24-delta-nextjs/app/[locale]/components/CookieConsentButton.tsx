'use client'

import { useState, useEffect } from 'react';

const CookieConsentButton = () => {
    const [cookieConsent, setCookieConsent] = useState('Loading...');

    useEffect(() => {
        const script = document.createElement('script');
        script.id = 'CookieDeclaration';
        script.src = 'https://consent.cookiebot.com/58b647b2-3fa9-4102-9136-1ab1f33c7755/cd.js';
        script.async = true;
        document.body.appendChild(script);

        window.addEventListener('CookiebotOnAccept', () => {
            setCookieConsent('Cookies Accepted');
        });

        window.addEventListener('CookiebotOnDecline', () => {
            setCookieConsent('Cookies Declined');
        });

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <button className="text-zinc-300">{cookieConsent}</button>
    );
};

export default CookieConsentButton;