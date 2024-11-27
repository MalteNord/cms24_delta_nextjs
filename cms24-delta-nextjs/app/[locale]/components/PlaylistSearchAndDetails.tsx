
'use client';

import { useState } from 'react';
import PlaylistDetails from "@/app/[locale]/components/PlaylistDetails";
import SearchPlaylists from "@/app/[locale]/components/SearchPlaylist";
interface PlaylistSearchAndDetailsProps {
    locale: string;
}

export default function PlaylistSearchAndDetails({ locale }: PlaylistSearchAndDetailsProps) {
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

    const handleSelectPlaylist = (id: string) => {
        setSelectedPlaylistId(id);
    };

    return (
        <div>
            {!selectedPlaylistId ? (
                <SearchPlaylists
                    locale={locale}
                    onSelectPlaylist={handleSelectPlaylist}
                />
            ) : (
                <PlaylistDetails
                    locale={locale}
                    playlistId={selectedPlaylistId}
                />
            )}
        </div>
    );
}
