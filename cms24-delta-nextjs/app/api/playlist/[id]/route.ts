// /app/api/playlist/[id]/route.ts

import { NextResponse } from 'next/server';
import { getPlaylistById } from '@/lib/api/spotifyApi';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const playlist = await getPlaylistById(id);
        if (!playlist) {
            return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
        }
        return NextResponse.json(playlist, { status: 200 });
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
