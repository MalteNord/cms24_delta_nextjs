'use client'
import React, { useEffect, useState, useRef } from "react";
import { HubConnection } from "@microsoft/signalr";
import { createGameConnection } from "@/lib/signalR/gameConnection";

interface ScoreboardProps {
    roomId: string;
    locale: string;
    currentUserId: string;
    currentUserName: string;
}

interface TrackInfo {
    trackId: string;
    trackName: string;
    artistName: string;
    artistIds: string[];
}

interface ScoreUpdate {
    userId: string;
    points: number;
}

interface PlayerScore {
    points: number;
    timestamp: number;
}

const Scoreboard = ({ roomId, locale, currentUserId, currentUserName }: ScoreboardProps) => {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [players, setPlayers] = useState<string[]>([]);
    const [connecting, setConnecting] = useState(false);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
    const [answeredPlayers, setAnsweredPlayers] = useState<Set<string>>(new Set());

    const totalScores = useRef<Record<string, number>>({});

    useEffect(() => {
        const options = {
            locale,
            onGameEnd: (endGameData: { players: string[]; scores: Record<string, number> }) => {
                console.log("Game ended:", endGameData);
                setScores(totalScores.current);
                setAnsweredPlayers(new Set()); // Clear answered players on game end
            },
        };

        const initializeConnection = async () => {
            try {
                const newConnection = await createGameConnection(
                    roomId,
                    setPlayers,
                    setScores,
                    setConnecting,
                    setConnection,
                    options
                );

                if (newConnection) {
                    newConnection.off("ReceiveUpdatedScores");
                    newConnection.off("OnTrackChanged");
                    newConnection.off("ReceivePlayerSubmission");

                    // Add new handler for player submissions
                    newConnection.on("ReceivePlayerSubmission", (playerName: string) => {
                        console.log("Player submitted answer:", playerName);
                        setAnsweredPlayers(prev => new Set([...prev, playerName]));
                    });

                    newConnection.on("OnTrackChanged", (trackInfo: TrackInfo) => {
                        if (trackInfo.trackId !== currentTrackId) {
                            setCurrentTrackId(trackInfo.trackId);
                            setAnsweredPlayers(new Set()); // Clear answered players when track changes
                        }
                    });

                    newConnection.on("ReceiveUpdatedScores", (updatedScores: Record<string, number>) => {
                        console.log("Received updated scores:", updatedScores);
                        totalScores.current = { ...updatedScores };
                        setScores(updatedScores);
                    });

                    newConnection.on("ReceivePlayers", (playerNames: string[]) => {
                        console.log("Players received:", playerNames);
                        setPlayers(playerNames);
                    });

                    newConnection.on("ReceiveScores", (initialScores: Record<string, number>) => {
                        console.log("Received initial scores:", initialScores);
                        totalScores.current = { ...initialScores };
                        setScores(initialScores);
                    });
                }
            } catch (error) {
                console.error("Error initializing connection:", error);
            }
        };

        initializeConnection();

        return () => {
            if (connection) {
                connection.stop().then(() => console.log("Connection stopped."));
            }
        };
    }, [roomId, locale]);

    const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);

    if (connecting) {
        return (
            <div className="p-4 text-center">
                <div className="animate-pulse text-lg">Connecting to scoreboard...</div>
            </div>
        );
    }

    return (
        <div className="bg-stone-900 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-200">Scoreboard</h2>
            <div className="space-y-4">
                {sortedScores.map(([playerName, score], index) => (
                    <div
                        key={playerName}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                            playerName === currentUserName
                                ? "bg-background-gray border-2 border-blue-200"
                                : "bg-background-gray"
                        } ${
                            answeredPlayers.has(playerName)
                                ? "border-2 border-green-mid"
                                : "border-2 border-neutral-500"
                        }`}
                    >
                        <div className="flex items-center bg space-x-3">
                            <span className="font-semibold text-gray-400">#{index + 1}</span>
                            <span className="text-lg font-medium text-gray-100">
                                {playerName}
                                {answeredPlayers.has(playerName) && (
                                    <span className="ml-2 font-bold text-green-mid">✓</span>
                                )}
                            </span>
                        </div>
                        <span className="text-xl font-bold text-green-mid">{score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Scoreboard;