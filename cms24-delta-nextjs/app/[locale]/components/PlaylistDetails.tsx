'use client';

import React, { useEffect, useState } from 'react';
import CustomSpotifyPlayer from "@/app/[locale]/components/CustomSpotifyPlayer";
import { Playlist } from "@/types/spotify";

interface PlaylistDetailsProps {
    playlistId: string;
    locale: string;
}

interface searchTextData {
    playlistDescription: string;
    playlistBy: string;
}

export default function PlaylistDetails({ locale, playlistId }: PlaylistDetailsProps) {
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [playlistDetailsTextData, setPlaylistDetailsTextData] = useState<searchTextData | null>(null);

    // First useEffect for fetching playlist details text
    useEffect(() => {
        async function fetchPlaylistDetailsText() {
            try {
                const response = await fetch(`http://localhost:39457/umbraco/delivery/api/v2/content/item/${locale}/game`);
                const data = await response.json();
                setPlaylistDetailsTextData({
                    playlistDescription: data.properties?.playlistDescription || '',
                    playlistBy: data.properties?.playlistBy || '',
                });
            } catch (error) {
                console.error('Cannot fetch playlist details text data', error);
                setError('Cannot load playlist details content');
            }
        }
        fetchPlaylistDetailsText();
    }, [locale]);

    // Second useEffect for fetching playlist
    useEffect(() => {
        const fetchPlaylist = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/playlist/${playlistId}`);
                if (!response.ok) {
                    throw new Error(`Error fetching playlist: ${response.statusText}`);
                }
                const data = await response.json();
                setPlaylist(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load playlist.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [playlistId]);

    if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid"></div>
    if (error) return <p className="text-red-500">{error}</p>;
    if (!playlist || !playlistDetailsTextData) return <p>Playlist not found or failed to load.</p>;

    const { playlistDescription, playlistBy } = playlistDetailsTextData;

    return (
        <div className="flex flex-col items-center mt-10 p-10 space-y-4 bg-stone-900 shadow-xl shadow-black/40 relative rounded-lg max-w-md mx-auto">
            {playlist.playlistImageUrl ? (
                <img
                    className="w-1/2 max-w-xs border-16 border-gray-200 rounded-md shadow-sm"
                    src={playlist.playlistImageUrl}
                    alt={playlist.name}
                />
            ) : (
                <img
                    className="w-full max-w-xs rounded-md shadow-sm"
                    src="/default-cover.jpg"
                    alt="Default Cover"
                />
            )}
            <h1 className="text-xl text-gray-200 font-bold text-center">{playlist.name}</h1>
            <h2 className="text-sm text-gray-200 font-semibold text-center">{playlistBy} {playlist.ownerName}</h2>
            <p className="text-sm text-gray-200 text-center">{playlist.description || `${playlistDescription}`}</p>
            <CustomSpotifyPlayer playlistId={playlistId} tracks={playlist.tracks} />
        </div>
    );
}