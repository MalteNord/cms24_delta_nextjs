// /app/[locale]/components/UpcomingTracks.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { Track } from '@/types/spotify';

interface UpcomingTracksProps {
    tracks: Track[];
    currentTrackIndex: number | null; // null if no track is currently playing
}

export default function UpcomingTracks({ tracks, currentTrackIndex }: UpcomingTracksProps) {
    const listRef = useRef<HTMLUListElement>(null);
    const currentItemRef = useRef<HTMLLIElement | null>(null); // Ref for the currently playing track

    useEffect(() => {
        if (currentItemRef.current) {
            currentItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        } else if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    }, [currentTrackIndex]);

    if (tracks.length === 0) {
        return <p className="text-gray-400">No upcoming tracks.</p>;
    }

    return (
        <div className="mt-4 w-full max-w-md">
            <h3 className="flex justify-center text-lg text-gray-200 font-semibold mb-2"></h3>
            <div className="max-h-32 overflow-y-auto px-2 custom-scrollbar">
                <ul className="space-y-2" ref={listRef} role="list" aria-label="Upcoming Tracks">
                    {tracks.map((track, index) => {
                        const isCurrent = currentTrackIndex !== null && index === currentTrackIndex;
                        const isPlayed = currentTrackIndex !== null && index < currentTrackIndex;

                        return (
                            <li
                                key={track.id}
                                ref={isCurrent ? currentItemRef : null}
                                className={`flex items-center space-x-2 rounded-md p-2 transition-colors ${
                                    isCurrent
                                        ? 'bg-gray-700 text-green-mid'
                                        : isPlayed
                                            ? 'text-gray-500' 
                                            : 'text-gray-300 hover:bg-gray-700'
                                }`}
                                aria-current={isCurrent ? 'true' : undefined}
                            >
                                <span className="text-green-mid">
                                    {isPlayed ? '-' : index + 1}.
                                </span>
                                <span>{track.name} - {track.artists.join(', ')}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
