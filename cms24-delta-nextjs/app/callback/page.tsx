'use client'
import React, {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import {useRouter} from "next/navigation";

export default function CallbackPage({
                                         searchParams,
                                     }: {
    searchParams: { code?: string };
}) {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false); // Check if component has mounted
    const code = searchParams.code;
    const existingToken = Cookies.get('spotify_access_token');
    const [status, setStatus] = useState(existingToken ? "Login successful! Access token is already stored." : 'Loading...');
    const [hasFetched, setHasFetched] = useState(!!existingToken);

    useEffect(() => {
        // Set mounted to true once the component has rendered on the client
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (existingToken) {
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } else {
            setHasMounted(true);
        }
    })
    useEffect(() => {
        if (!hasMounted) return; // Prevent running on the server

        const delayFetch = setTimeout(async () => {
            if (hasFetched || !code) {
                return;
            }

            try {
                console.log("Fetching access token from backend...");
                const response = await fetch(`https://quizify.azurewebsites.net/api/spotify/callback?code=${code}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    setStatus("Failed to retrieve access token from backend.");
                    setHasFetched(true);
                    return;
                }

                const result = await response.json();
                const accessToken = result.accessToken;

                if (accessToken) {
                    Cookies.set('spotify_access_token', accessToken, {expires: 1 / 24, secure: false});
                    setStatus("Login successful! Access token stored.");

                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setStatus("Access token is missing from backend response.");
                }
                setHasFetched(true);
            } catch (error) {
                setStatus("An error occurred during the login process.");
                console.error("Error during callback:", error);
                setHasFetched(true);
            }
        }, 1000);

        return () => clearTimeout(delayFetch);
    }, [code, hasFetched, hasMounted]);

    if (!hasMounted) {
        return null;
    }

    return (
        <div className="callback-page flex items-center justify-center h-screen bg-background-gray">
            <div className="bg-black p-8 rounded-lg shadow-black shadow-lg w-full max-w-md text-center">
                <h1 className="text-4xl bg-gradient-to-r from-green-dark via-green-mid to-green-dark bg-clip-text text-transparent font-bold mb-4">QUIZIFY</h1>
                {status === 'Loading...' ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid"></div>
                        <p className="mt-4 text-green-mid">Loading...</p>
                    </div>
                ) : (
                    <p className="text-zinc-200 text-lg">{status}</p>
                )}
                <a href="/"
                   className="mt-6 p-2 rounded-full bg-green-mid hover:bg-green-dark text-white inline-flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 12l2-2m0 0l7-7 7 7m-9 8v-6h4v6m5-6l2 2m-2-2l-7-7-7 7"/>
                    </svg>
                </a>
                <div className="flex flex-col items-center">
                    <p className="text-zinc-200 mt-5 text-lg">Redirecting</p>
                    <div className="dotbox">
                        <span className="dot-1 text-green-mid">.</span>
                        <span className="dot-2 text-green-mid">.</span>
                        <span className="dot-3 text-green-mid">.</span>
                    </div>
                </div>
            </div>
            <style jsx>{`
              @keyframes dot-blink {
                0%, 20% {
                  opacity: 0;
                }
                50% {
                  opacity: 1;
                }
                100% {
                  opacity: 0;
                }
              }

              .dotbox {
                margin-top: -3rem;
              }

              .dot-1, .dot-2, .dot-3 {
                animation: dot-blink 1.4s infinite both;
                font-weight: bold;
                font-size: 5em; /* Optional: makes the dots larger */
              }

              .dot-1 {
                animation-delay: 0s;
              }

              .dot-2 {
                animation-delay: 0.2s;
              }

              .dot-3 {
                animation-delay: 0.4s;
              }
            `}</style>
        </div>
    );
}
