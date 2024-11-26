import { Track } from "@/types/spotify";
import { Playlist } from "@/types/spotify";
import { getServerSideProps} from "next/dist/build/templates/pages";

export async function getTrackById(trackId: string): Promise<Track | null> {
    try {
        const response = await fetch(
            `https://quizify.azurewebsites.net/api/Spotify/track/${trackId}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch track data");
        }

        const track: Track = await response.json();
        return track;
    } catch (error) {
        console.error("Error fetching track:", error);
        return null;
    }
}

export async function getPlaylistById(playlistId: string): Promise<Playlist | null> {
    try {
        const response = await fetch(
            `https://quizify.azurewebsites.net/api/Spotify/playlist/${playlistId}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch playlist data");
        }

        const playlist: Playlist = await response.json();
        return playlist;
    } catch (error) {
        console.error("Error fetching playlist", error);
        return null;
    }
}


export async function searchPlaylists(query: string) {
    const response = await fetch(`https://quizify.azurewebsites.net/api/spotify/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to search playlists');
    }

    return response.json();
}

export async function searchUserPlaylists(userId: string) {
    const response = await fetch(`https://quizify.azurewebsites.net/api/spotify/user/${userId}/playlists`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user playlists');
    }

    return response.json();
}

export async function callNextTrackBackend() {
    try {
        const response = await fetch(`https://quizify.azurewebsites.net/api/spotify/next`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(!response.ok) {
            throw new Error(`Failed to call backend next track endpoint: ${response.statusText}`);
        }

        console.log("Backend endpoint called successfully.");
    } catch (error) {
        console.error("Error in calling backend for next track", error)
        throw error;
    }
}