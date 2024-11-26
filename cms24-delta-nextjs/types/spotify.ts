export interface Track {
    id: string;
    name: string;
    albumName: string;
    artists: string[];
    externalUrl: string;
    albumCoverUrl: string | null;
    uri: string;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    externalUrl: string;
    playlistImageUrl: string | null;
    uri: string;
    tracks: Track[];
    ownerName?: string;
    ownerUrl?: string;
}