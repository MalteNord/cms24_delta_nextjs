"use client";

import React, { useEffect, useState } from "react";
import Answer from "../components/Answers";
import Scoreboard from "../components/Scoreboard";
import { fetchPlayerRole } from "@/lib/fetchPlayerRole";
import { HubConnection } from "@microsoft/signalr";
import { useSearchParams, useRouter } from "next/navigation";
import PlaylistSearchAndDetails from "./PlaylistSearchAndDetails";
import { useSpotifyPlayer } from "@/app/context/SpotifyPlayerContext";
import { createGameConnection } from "@/lib/signalR/gameConnection";
import { FaCrown } from "react-icons/fa";

interface Player {
  userId: string;
  name: string;
  host: boolean;
}

interface GameContentProps {
  locale: string;
}

const GameContent = ({ locale }: GameContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || "";
  const userId = searchParams.get("userId");

  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isHost, setIsHost] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [properties, setProperties] = useState<any>(null);

  const { currentTrackId, artistIds, trackName, artistName } =
    useSpotifyPlayer();
  const [currentSongVersion, setCurrentSongVersion] = useState(0);

  const [currentGameTrack, setCurrentGameTrack] = useState<{
    trackId: string;
    trackName: string;
    artistName: string;
    artistIds: string[];
  }>({
    trackId: "",
    trackName: "No Track",
    artistName: "No Artist",
    artistIds: [],
  });

  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    if (players.length > 0 && userId) {
      const currentPlayer = players.find((p) => p.userId === userId);
      if (currentPlayer) {
        setCurrentUserName(currentPlayer.name);
      }
    }
  }, [players, userId]);


  useEffect(() => {
    if (currentTrackId && connection && isHost) {
      const trackInfo = {
        trackId: currentTrackId,
        trackName,
        artistName,
        artistIds,
      };

      console.log("Host: Track changed, notifying other players...", /*trackInfo*/);

      connection
        .invoke("TrackChanged", roomId, JSON.stringify(trackInfo))
        .then(() => {
          console.log("Host: Track change notification sent successfully");
          setCurrentGameTrack(trackInfo);
        })
        .catch((err) => {
          console.error("Host: Error sending track change notification:", err);
        });
    }
  }, [
    currentTrackId,
    connection,
    roomId,
    isHost,
    trackName,
    artistName,
    artistIds,
  ]);


  useEffect(() => {
    if (roomId && userId) {
      fetchPlayerRole(
        roomId,
        userId,
        setIsHost,
        () => {},
        (error) => console.error("Error fetching player role:", error)
      );

      const initializeConnection = async () => {
        try {
          const newConnection = await createGameConnection(
            roomId,
            setPlayers,
            setScores,
            setConnecting,
            setConnection,
            {
              locale,
              onGameEnd: (endGameData) => {
                const url = `/${locale}/end?roomId=${encodeURIComponent(
                  roomId
                )}&players=${encodeURIComponent(
                  JSON.stringify(endGameData.players)
                )}&scores=${encodeURIComponent(
                  JSON.stringify(endGameData.scores)
                )}`;
                console.log("Redirecting player to URL:", url);
                router.push(url);
              },
            }
          );

          if (newConnection) {
            newConnection.on("onTrackChanged", (trackInfoStr: string) => {
              try {
                const trackInfo = JSON.parse(trackInfoStr);
                console.log(
                  "Client: Received track change notification:",
                  //trackInfo
                );

                if (!isHost) {
                  setCurrentGameTrack(trackInfo);
                }
              } catch (error) {
                console.error("Client: Error parsing track info:", error);
              }
            });
          }
        } catch (error) {
          console.error("Error initializing connection:", error);
        }
      };

      initializeConnection();
    }

    return () => {
      if (connection) {
        connection
          .stop()
          .catch((err) => console.error("Error stopping connection:", err));
      }
    };
  }, [roomId, userId]);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(
          `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/game`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProperties(data.properties);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchGameData();
  }, [locale]);

  const handleEndGame = async () => {
    try {
      if (connection) {
        await connection.invoke("EndGame", roomId);
        console.log("EndGame event triggered");

        const url = `/${locale}/end?&roomId=${encodeURIComponent(
          roomId
        )}&players=${encodeURIComponent(
          JSON.stringify(players.map((p) => p.name))
        )}&scores=${encodeURIComponent(JSON.stringify(scores))}`;
        router.push(url);
      }
    } catch (error) {
      console.error("Error triggering EndGame event:", error);
    }
  };

  if (!properties) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid" />
  </div>
  if (connecting) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid" />
  </div>

  const { lobbyHeading, endGameButton } = properties;

  return (
    <div className="flex flex-col items-center">
      {/*<div className="mt-5">
        <div className="w-[15vw] h-[20vh] bg-gray-800 rounded-md p-4 shadow-md">
          <h1 className="text-3xl text-center font-bold">{lobbyHeading}:</h1>
          <ul className="mt-4">
            {players.map((player) => (
              <li key={player.userId} className="text-md font-bold">
                {player.name}
                {player.host && (
                  <FaCrown
                    className="inline ml-2 text-yellow-500"
                    title="Host"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>*/}
      <div className="mt-5">
      {isHost && (
          <div className="mt-3">
            <Scoreboard
                roomId={roomId}
                locale={locale}
                currentUserId={userId ?? ""}
                currentUserName={currentUserName || ""}
            />
          </div>
      )}
        {isHost ? (
          <PlaylistSearchAndDetails locale={locale} />
        ) : (
          <Answer
            params={{ locale }}
            roomId={roomId}
            userId={userId ?? ""}
            currentTrack={currentGameTrack}
            key={currentGameTrack?.trackId ?? currentSongVersion}
          />
        )}
      </div>
      {isHost && (
          <button
              onClick={handleEndGame}
              className="text-center mt-32 p-10 bg-red-700 font-bold text-xl rounded-xl text-white my-6 py-4 hover:text-white hover:bg-red-900 transition duration-200"
          >
            {endGameButton}
          </button>
      )}
    </div>
  );
};

export default GameContent;
