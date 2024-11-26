'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useRef,
} from 'react';
import Cookies from 'js-cookie';

interface SpotifyPlayerContextType {
    isPlayerReady: boolean;
    isPlaying: boolean;
    trackName: string;
    artistName: string;
    albumCover: string;
    currentTrackId: string | null;
    artistIds: string[];
    play: (playlistId?: string, currentTrackIndex?: number) => void;
    pause: () => void;
    nextTrack: () => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(
    undefined
);

export function useSpotifyPlayer() {
    const context = useContext(SpotifyPlayerContext);
    if (!context) {
        throw new Error(
            'useSpotifyPlayer must be used within a SpotifyPlayerProvider'
        );
    }
    return context;
}

declare global {
    interface Window {
        Spotify: any;
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackName, setTrackName] = useState('');
    const [artistName, setArtistName] = useState('');
    const [albumCover, setAlbumCover] = useState('');
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [artistIds, setArtistIds] = useState<string[]>([]);
    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

    const playerRef = useRef<any>(null);
    const sdkScriptAddedRef = useRef(false);

    const disableShuffleAndRepeat = async (deviceId: string, accessToken: string) => {
        try {
            // Disable shuffle
            await fetch(
                `https://api.spotify.com/v1/me/player/shuffle?state=false&device_id=${deviceId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // Disable repeat
            await fetch(
                `https://api.spotify.com/v1/me/player/repeat?state=off&device_id=${deviceId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log('Shuffle and repeat modes disabled successfully');
        } catch (error) {
            console.error('Error disabling shuffle and repeat:', error);
        }
    };

    useEffect(() => {
        const accessToken = Cookies.get('spotify_access_token');
        if (!accessToken) {
            console.error(
                'Access token is missing. Ensure you are logged in.'
            );
            return;
        }

        const addSpotifySdk = () => {
            if (!window.Spotify && !sdkScriptAddedRef.current) {
                const script = document.createElement('script');
                script.src = 'https://sdk.scdn.co/spotify-player.js';
                script.async = true;
                document.body.appendChild(script);
                sdkScriptAddedRef.current = true;
            }
        };

        addSpotifySdk();

        const onSpotifyWebPlaybackSDKReady = () => {
            if (playerRef.current) {
                console.log('Player already initialized.');
                return;
            }

            const spotifyPlayer = new window.Spotify.Player({
                name: 'Quizify Spotify Player',
                getOAuthToken: (cb: (token: string) => void) => {
                    cb(accessToken);
                },
                volume: 0.5,
            });

            playerRef.current = spotifyPlayer;

            // Error Handling
            spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
                console.error('Initialization Error:', message);
            });

            spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
                console.error('Authentication Error:', message);
            });

            spotifyPlayer.addListener('account_error', ({ message }: any) => {
                console.error('Account Error:', message);
            });

            spotifyPlayer.addListener('playback_error', ({ message }: any) => {
                console.error('Playback Error:', message);
            });

            // Ready
            spotifyPlayer.addListener('ready', async ({ device_id }: any) => {
                console.log('Player is ready with Device ID', device_id);
                setDeviceId(device_id);

                try {
                    // Transfer playback to the new device without starting playback
                    const transferResponse = await fetch(
                        `https://api.spotify.com/v1/me/player`,
                        {
                            method: 'PUT',
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ device_ids: [device_id], play: false }),
                        }
                    );

                    if (transferResponse.ok) {
                        console.log(
                            'Playback successfully transferred to the custom player.'
                        );
                    } else {
                        console.error(
                            'Failed to transfer playback:',
                            transferResponse.statusText
                        );
                    }

                    // Explicitly pause playback to ensure no audio is playing
                    const pauseResponse = await fetch(
                        `https://api.spotify.com/v1/me/player/pause?device_id=${device_id}`,
                        {
                            method: 'PUT',
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (pauseResponse.ok) {
                        console.log('Playback successfully paused.');
                    } else {
                        console.error(
                            'Failed to pause playback:',
                            pauseResponse.statusText
                        );
                    }

                    setIsPlayerReady(true);
                } catch (error) {
                    console.error('Error transferring playback:', error);
                }
            });

            // Not Ready
            spotifyPlayer.addListener('not_ready', ({ device_id }: any) => {
                console.log('Device ID has gone offline', device_id);
                setIsPlayerReady(false);
            });

            // Player state changed
            spotifyPlayer.addListener('player_state_changed', (state: any) => {
                if (!state) return;
                setIsPlaying(!state.paused);

                const currentTrack = state.track_window.current_track;
                if (currentTrack) {
                    setTrackName(currentTrack.name);
                    setArtistName(
                        currentTrack.artists.map((artist: any) => artist.name).join(', ')
                    );
                    setAlbumCover(currentTrack.album.images[0]?.url || '');
                    setArtistIds(currentTrack.artists.map((artist: any) => artist.id));
                    setCurrentTrackId(currentTrack.id); // Update currentTrackId
                }
            });

            // Connect the player
            spotifyPlayer.connect().then((success: boolean) => {
                if (success) {
                    console.log('Spotify Player connected');
                } else {
                    console.error('Failed to connect Spotify Player');
                }
            });
        };

        // Attach the callback
        window.onSpotifyWebPlaybackSDKReady = onSpotifyWebPlaybackSDKReady;

        // Cleanup function to disconnect player on unmount
        return () => {
            if (playerRef.current) {
                playerRef.current.disconnect();
                playerRef.current = null;
            }
        };
    }, []);

    const play = async (
        playlistId?: string,
        trackIndex?: number
    ) => {
        const player = playerRef.current;
        if (!player || !isPlayerReady || !deviceId) {
            console.error('Player is not ready');
            return;
        }

        const accessToken = Cookies.get('spotify_access_token');
        if (!accessToken) {
            console.error(
                'Access token is missing. Ensure you are logged in.'
            );
            return;
        }

        let response: Response;

        if (playlistId && trackIndex !== undefined) {
            try {
                // First disable shuffle and repeat before starting new playlist
                await disableShuffleAndRepeat(deviceId, accessToken);

                const playBody = {
                    context_uri: `spotify:playlist:${playlistId}`,
                    offset: { position: trackIndex },
                    position_ms: 0,
                };

                response = await fetch(
                    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                    {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(playBody),
                    }
                );
            } catch (error) {
                console.error('Error during play sequence:', error);
                return;
            }
        } else {
            // Resume playback without specifying context_uri and offset
            response = await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        if (response.ok) {
            console.log('Playback started or resumed successfully.');
            setIsPlaying(true);
        } else {
            const errorData = await response.json();
            if (playlistId && trackIndex !== undefined) {
                console.error(
                    'Error starting playback:',
                    response.statusText,
                    errorData
                );
            } else {
                console.error(
                    'Error resuming playback:',
                    response.statusText,
                    errorData
                );
            }
        }
    };

    const pause = async () => {
        const player = playerRef.current;
        if (!player || !isPlayerReady || !deviceId) {
            console.error('Player is not ready');
            return;
        }

        const accessToken = Cookies.get('spotify_access_token');
        if (!accessToken) {
            console.error(
                'Access token is missing. Ensure you are logged in.'
            );
            return;
        }

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                console.log('Playback paused.');
                setIsPlaying(false);
            } else {
                const errorData = await response.json();
                console.error(
                    'Error pausing playback:',
                    response.statusText,
                    errorData
                );
            }
        } catch (error) {
            console.error('Error pausing playback:', error);
        }
    };

    const nextTrack = async () => {
        const player = playerRef.current;
        if (!player || !isPlayerReady || !deviceId) {
            console.error('Player is not ready');
            return;
        }

        const accessToken = Cookies.get('spotify_access_token');
        if (!accessToken) {
            console.error(
                'Access token is missing. Ensure you are logged in.'
            );
            return;
        }

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                console.log('Next track triggered.');
            } else {
                const errorData = await response.json();
                console.error(
                    'Error triggering next track:',
                    response.statusText,
                    errorData
                );
            }
        } catch (error) {
            console.error('Error triggering next track:', error);
        }
    };

    const value = {
        isPlayerReady,
        isPlaying,
        trackName,
        artistName,
        artistIds,
        albumCover,
        currentTrackId,
        play,
        pause,
        nextTrack,
    };

    return (
        <SpotifyPlayerContext.Provider value={value}>
            {children}
        </SpotifyPlayerContext.Provider>
    );
}