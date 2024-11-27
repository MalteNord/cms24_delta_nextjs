'use client'
import React, { useState, useEffect } from 'react';

interface CookieButtonProps {
    className?: string;
}

const CookieConsentButton: React.FC<CookieButtonProps> = ({ className }) => {
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
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return <button className={className}>{cookieConsent}</button>;
};

export default CookieConsentButton;