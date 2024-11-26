"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createSignalRConnection } from "@/lib/signalR/signalrConnection";
import { fetchPlayerRole } from "@/lib/fetchPlayerRole";
import { HubConnection } from "@microsoft/signalr";
import { FaCrown } from "react-icons/fa";

interface Player {
  userId: string;
  name: string;
  host: boolean;
}

interface LobbyContentProps {
  data: {
    topHeading?: string;
    mainParagraph?: string;
    buttonText?: string;
    waitingText?: string;
    listHeading?: string;
  };
  locale: string;
}

const LobbyContent = ({ data, locale }: LobbyContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const userId = searchParams.get("userId");
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connecting, setConnecting] = useState(false);
  // const [playerName, setPlayerName] = useState<string | null>(null);

  const handleStartGameEvent = () => {
    console.log("Received StartGame event from SignalR hub.");
    const params = new URLSearchParams({
      roomId: roomId || "",
      userId: userId || "",
    });
    router.push(`/${locale}/game?${params.toString()}`);
  };

  useEffect(() => {
    fetchPlayerRole(roomId, userId, setIsHost, setLoading, setError);
  }, [roomId, userId]);

  useEffect(() => {
    if (!roomId) return;

    const connect = async () => {
      const newConnection = await createSignalRConnection(
        roomId,
        setPlayers,
        setConnecting,
        setConnection,
        handleStartGameEvent
      );
    };

    connect();

    return () => {
      if (connection && connection.state === "Connected") {
        connection
          .stop()
          .then(() => console.log("Disconnected from SignalR hub"))
          .catch((error) => console.error("Error disconnecting:", error));
      }
    };
  }, [roomId]);

  const handleStartGame = async () => {
    if (isHost && connection) {
      try {
        const response = await fetch(
          `http://localhost:39457/api/game/${roomId}/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error starting the game:", errorData.message);
          return;
        }

        console.log("Backend successfully started the game.");

        await connection.invoke("StartGame", roomId);
        console.log("StartGame event sent to SignalR hub.");

        const params = new URLSearchParams({
          roomId: roomId || "",
          userId: userId || "",
        });

        router.push(`/${locale}/game?${params.toString()}`);
      } catch (error) {
        console.error("Error starting the game:", error);
      }
    }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid"></div>
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="my-5">
      <h1 className="text-zinc-200 text-center mt-3 mb-5 text-5xl font-bold">{data.topHeading}</h1>
      <p className="text-zinc-200 text-center mb-5 text-2xl font-bold my-40">
        {data.mainParagraph}
      </p>

      <div className="w-fit rounded-md bg-green-dark py-2 px-4 mx-auto">
        <p className="text-zinc-200 text-center font-bold text-4xl">{roomId}</p>
      </div>

      <div className="relative my-6">
        <h1 className="text-zinc-200 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 text-2xl font-bold bg-background-gray rounded-lg">
          {data.listHeading}
        </h1>
        <ul className="max-w-md mx-auto border rounded p-2 mt-6">
          {players.map((player) => (
            <li className="text-zinc-200 text-md font-bold text-2xl" key={player.userId}>
              {player.name}
              {player.host && (
                <FaCrown className="inline mb-1.5 ml-2 text-yellow-500" title="Host" />
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center mt-5">
        {isHost ? (
          <button
            onClick={handleStartGame}
            className="text-center p-10 bg-green-mid font-bold text-xl rounded-xl text-white my-6 py-4 hover:text-white hover:bg-green-dark transition duration-200"
          >
            {data.buttonText?.toUpperCase() || "Start Game"}
          </button>
        ) : (
          <p className="text-zinc-200 font-bold text-2xl">{data.waitingText}</p>
        )}
      </div>
    </div>
  );
};

export default LobbyContent;
