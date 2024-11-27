// /app/components/CustomSpotifyPlayer.tsx

'use client';
import { useEffect, useState } from 'react';
import { useSpotifyPlayer } from '@/app/context/SpotifyPlayerContext';
import UpcomingTracks from '@/app/[locale]/components/UpcomingTracks';
import { Track } from '@/types/spotify';
import { callNextTrackBackend } from "@/lib/api/spotifyApi";
import { BiSolidSkipNextCircle } from "react-icons/bi";
import {FaArrowDown, FaPlayCircle} from "react-icons/fa";
import { FaPauseCircle } from "react-icons/fa";
import Image from "next/image";

interface CustomSpotifyPlayerProps {
    playlistId: string;
    tracks: Track[];
}

export default function CustomSpotifyPlayer({
                                                playlistId,
                                                tracks,
                                            }: CustomSpotifyPlayerProps) {
    const {
        isPlayerReady,
        isPlaying,
        trackName,
        artistName,
        albumCover,
        currentTrackId,
        play,
        pause,
        nextTrack,
    } = useSpotifyPlayer();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isNewPlayback, setIsNewPlayback] = useState(true);
    const [highlight, setHighlight] = useState(true);
    const [playlistEnded, setPlaylistEnded] = useState(false);
    const [triggerNextTrack, setTriggerNextTrack] = useState(false);

    useEffect(() => {
        setIsNewPlayback(true);
        setHighlight(true);
        const timeout = setTimeout(() => setHighlight(false), 1500); // Highlight duration
        setIsLoading(false); // Since player is managed in context
        setPlaylistEnded(false); // Reset playlistEnded when a new playlist is loaded
        return () => clearTimeout(timeout);
    }, [playlistId, tracks]);

    useEffect(() => {
        if (currentTrackId) {
            const index = tracks.findIndex((track) => track.id === currentTrackId);
            setCurrentTrackIndex(index !== -1 ? index : null);
        } else {
            setCurrentTrackIndex(null);
        }
    }, [currentTrackId, tracks]);


    useEffect(() => {
        if (
            currentTrackIndex !== null &&
            currentTrackIndex === tracks.length - 1 &&
            !isPlaying
        ) {

            setPlaylistEnded(true);
            console.log('Playlist has ended.');
        }
    }, [currentTrackIndex, isPlaying, tracks.length]);

    const handlePlayPause = () => {
        if (playlistEnded) {
            console.log('Playlist has ended. Play button is disabled.');
            return;
        }

        if (isPlaying) {
            pause();
        } else {
            if (isNewPlayback) {
                play(playlistId, currentTrackIndex !== null ? currentTrackIndex : 0);
                setIsNewPlayback(false);
            } else {
                play();
            }
        }
    };

    const handleNextTrack = () => {
        if (playlistEnded) {
            console.log('Playlist has ended. Cannot skip to next track.');
            return;
        }

        setTriggerNextTrack(true);
    };

    useEffect(() => {
        const triggerNext = async () => {
            try {
                if (triggerNextTrack) {
                    await callNextTrackBackend();
                    nextTrack();
                }
            } catch (error) {
                console.error('Error during backend call or skipping track:', error);
            } finally {
                setTriggerNextTrack(false);
            }
        };

        if (triggerNextTrack) {
            triggerNext();
        }
    }, [triggerNextTrack, nextTrack]);

    return (
        <div className="w-full max-w-xs mx-auto bg-black border-green-dark border-2 rounded-lg shadow-lg p-8 flex flex-col items-center space-y-4">
            {isLoading || !isPlayerReady ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid" />
            ) : (
                <>
                    <div className="w-32 h-32 overflow-hidden rounded-md shadow-md">
                        <img
                            src={albumCover}
                            alt={trackName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-lg text-gray-200 font-semibold text-center">
                        {trackName || (
                            <span className="font-bold text-green-mid">
                                Start!
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-gray-300 text-center">
                        {artistName || <FaArrowDown />}
                    </p>
                    <div className="flex flex-col items-center mt-2">
                        <button
                            onClick={handlePlayPause}
                            disabled={!isPlayerReady || playlistEnded}
                            className={`p-6 bg-green-mid text-white rounded-full shadow-md hover:bg-green-dark transition disabled:opacity-50 ${
                                highlight ? 'highlight-animation' : ''
                            }`}
                            aria-disabled={!isPlayerReady || playlistEnded}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <FaPauseCircle size={36} />
                            ) : (
                                <FaPlayCircle size={36} />
                            )}
                        </button>
                        <button
                            onClick={handleNextTrack}
                            disabled={!isPlayerReady || playlistEnded}
                            className="p-8 bg-green-mid font-bold text-gray-100 rounded-xl mt-6 shadow-md hover:bg-green-dark transition disabled:opacity-50"
                            aria-disabled={!isPlayerReady || playlistEnded}
                            aria-label="Next Track"
                        >
                            <BiSolidSkipNextCircle size={48} />
                        </button>
                    </div>
                    <UpcomingTracks
                        tracks={tracks}
                        currentTrackIndex={currentTrackIndex}
                    />
                    {playlistEnded && (
                        <p className="mt-4 text-green-mid font-semibold">
                            Playlist has ended.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
