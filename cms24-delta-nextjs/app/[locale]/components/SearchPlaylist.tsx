'use client';

import React, {useEffect, useState} from 'react';
import { searchPlaylists, searchUserPlaylists } from '@/lib/api/spotifyApi';
import { Playlist } from "@/types/spotify";

interface SearchPlaylistsProps {
    locale: string;
    onSelectPlaylist: (id: string) => void;
}

interface searchTextData {
    searchPlaceholder: string;
    searchByUser: string;
    searchByPlaylist: string;
    searchButtonText: string;
    playlistBy: string;
    searchResultsText: string;
}

export default function SearchPlaylists({ locale, onSelectPlaylist }: SearchPlaylistsProps) {
    const [query, setQuery] = useState<string>('');
    const [searchType, setSearchType] = useState<string>('playlist');
    const [searchResults, setSearchResults] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTextData, setSearchTextData] = useState<searchTextData | null>(null);


    useEffect(() => {
        async function fetchSearchText() {
            try {
                const response = await fetch(`https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/game`);
                const data = await response.json();
                setSearchTextData({
                    searchPlaceholder: data.properties?.searchPlaceholder || '',
                    searchByUser: data.properties?.searchByUser || '',
                    searchByPlaylist: data.properties?.searchByPlaylist || '',
                    searchButtonText: data.properties?.searchButtonText || '',
                    searchResultsText: data.properties?.searchResultsText || '',
                    playlistBy: data.properties?.playlistBy || '',

                });
            } catch (error) {
                console.error('Cannot fetch search text data', error);
                setError('Cannot load search text content');
            }
        }
        fetchSearchText();
    }, [locale]);

    if (!searchTextData) return

    const { searchPlaceholder, searchByUser, searchByPlaylist, searchButtonText, playlistBy, searchResultsText } = searchTextData;

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setError(null);

        try {
            let results: Playlist[] = [];
            if (searchType === 'user') {
                results = await searchUserPlaylists(query);
            } else {
                results = await searchPlaylists(query);
            }
            setSearchResults(results);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setError('Failed to fetch search results.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlaylist = (id: string) => {
        onSelectPlaylist(id);
    };

    return (
        <div className="w-full flex flex-col items-center mt-4">
            <div className="w-full flex flex-col items-center">
                <div className="flex flex-col w-full max-w-md space-y-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="text-zinc-200 px-4 py-2 rounded-lg bg-stone-900 border border-gray-500 w-full"
                    />

                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-4 text-zinc-200 bg-stone-900 py-2 border border-gray-500 rounded-lg w-full"
                    >
                        <option className="text-zinc-200" value="playlist">{searchByPlaylist}</option>
                        <option className="text-zinc-200" value="user">{searchByUser}</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        className="w-full font-bold px-4 py-2 bg-green-dark text-white rounded-lg hover:bg-green-mid cursor-pointer transition-all duration-300 ease-in-out"
                        disabled={!query || loading}
                    >
                        {searchButtonText}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="mt-3 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid"></div>
                </div>
            )}

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {searchResults.length > 0 && (
                <div className="w-full mt-4">
                    <h2 className="text-zinc-200 text-lg font-semibold px-8 mb-4">{searchResultsText}</h2>
                    <div className="max-h-96 overflow-y-auto px-2 custom-scrollbar">
                        <div className="space-y-4">
                            {searchResults.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    className="flex flex-col space-y-2 p-4 border-2 border-gray-600 bg-stone-900 rounded shadow cursor-pointer hover:bg-gray-700 transition-all duration-300 ease-in-out"
                                    onClick={() => handleSelectPlaylist(playlist.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <img
                                            className="w-12 h-12 rounded "
                                            src={playlist.playlistImageUrl || "/default-cover.jpg"}
                                            alt={playlist.name}
                                        />
                                        <div className="flex flex-col">
                                            <p className="text-zinc-200 font-semibold">{playlist.name}</p>
                                            <p className="text-sm text-zinc-400">{playlist.description || "No description available"}</p>
                                        </div>
                                    </div>
                                    {playlist.ownerName && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                                            <p>{playlistBy}: <span className="font-semibold">{playlist.ownerName}</span></p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}