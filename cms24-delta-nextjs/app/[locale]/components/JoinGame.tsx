'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface Params {
  locale: string;
}

interface JoinRoomData {
  joinRoomCode: string;
  joinRoomPlaceholder: string;
  joinButtonText: string;
  formTextName: string;
  placeHolderTextName: string;
}

function JoinGame({ params }: { params: Params }) {
  const locale = params.locale || 'sv';
  const [joinRoomData, setJoinRoomData] = useState<JoinRoomData | null>(null);
  const [error, setError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();


  useEffect(() => {
    async function fetchJoinRoomData() {
      try {
        const response = await fetch(`http://localhost:39457/umbraco/delivery/api/v2/content/item/${locale}/quiz`);
        const data = await response.json();
        setJoinRoomData({
          joinRoomCode: data.properties?.joinRoomCode || '',
          joinRoomPlaceholder: data.properties?.joinRoomPlaceholder || '',
          joinButtonText: data.properties?.joinButtonText || '',
          formTextName: data.properties?.formTextName || '',
          placeHolderTextName: data.properties?.placeholderTextName || '',
        });
      } catch (error) {
        console.error('Cannot fetch join room data', error);
        setError('Cannot load join room content');
      }
    }
    fetchJoinRoomData();
  }, [locale]);

  if (!joinRoomData) return

  const { joinRoomCode, joinRoomPlaceholder, joinButtonText, formTextName, placeHolderTextName } = joinRoomData;

 
  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userId = uuidv4(); 
    const payload = {
        playerName,
        userId,
    };

    const response = await fetch(`http://localhost:39457/api/game/${roomCode}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        const data = await response.json();
        router.push(`/${locale}/lobby?roomId=${roomCode}&userId=${userId}`);
    } else {
      alert("No active lobby found.");
    }
};

  

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <form className="grid justify-center" onSubmit={handleJoin}>
        <label className="text-zinc-200 grid justify-center mt-5 font-bold">
          {joinRoomCode}:
          <input
            className="w-full border-4 font-bold text-xl rounded-xl bg-gray-100 py-2 px-8 text-gray-500 text-center focus:outline-none focus:border-green-mid"
            type="text"
            name="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder={joinRoomPlaceholder}
            required
          />
        </label>

        <label className="text-zinc-200 grid justify-center mt-5 font-bold">
          {formTextName}:
          <input
            className="w-full border-4 font-bold text-xl rounded-xl bg-gray-100 py-2 px-8 text-gray-500 text-center focus:outline-none focus:border-green-mid"
            type="text"
            name="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder={placeHolderTextName}
            required
          />
        </label>

        <button
          className="h-14 bg-green-mid font-bold text-xl rounded-xl text-white my-6 py-0 hover:text-white hover:bg-green-dark transition duration-200"
          type="submit"
        >
          {joinButtonText}
        </button>
      </form>
    </div>
  );
}

export default JoinGame;
