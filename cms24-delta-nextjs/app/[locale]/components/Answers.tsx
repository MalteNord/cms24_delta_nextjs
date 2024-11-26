"use client";

import { useState, useEffect, useRef } from "react";
import useDebounce from "@/hooks/useDebounce";
import { useSpotifyPlayer } from "@/app/context/SpotifyPlayerContext";

const API_BASE_URL = `https://localhost:44376`;

interface Params {
  locale: string;
}

interface Track {
  id: string;
  name: string;
  artists: string[];
  externalUrl?: string;
  albumCoverUrl?: string;
  albumName?: string;
  uri?: string;
}

interface Artist {
  id: string;
  name: string;
  profileImageUrl?: string;
}

interface AnswerProps {
  params: Params;
  roomId: string;
  userId: string;
  currentTrack: {
    trackId: string;
    trackName: string;
    artistName: string;
    artistIds: string[];
  } | null;
}

function Answer({ params, roomId, userId, currentTrack }: AnswerProps) {
  const locale = params.locale || "sv";
  const [answerData, setAnswerData] = useState<any>(null);
  const [formLocked, setFormLocked] = useState(false);

  // Artist Search States
  const [artistName, setArtistName] = useState("");
  const debouncedArtistName = useDebounce(artistName, 300);
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [isArtistLoading, setIsArtistLoading] = useState(false);
  const [artistError, setArtistError] = useState<string | null>(null);

  // Track Search States
  const [songName, setSongName] = useState("");
  const debouncedSongName = useDebounce(songName, 300);
  const [trackResults, setTrackResults] = useState<Track[]>([]);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Refs for dropdowns and inputs
  const artistInputRef = useRef<HTMLInputElement>(null);
  const artistDropdownRef = useRef<HTMLUListElement>(null);
  const trackInputRef = useRef<HTMLInputElement>(null);
  const trackDropdownRef = useRef<HTMLUListElement>(null);

  // Refs for selection flags
  const isSelectingArtistRef = useRef(false);
  const isSelectingTrackRef = useRef(false);

  // State to track correctness
  const [isArtistCorrect, setIsArtistCorrect] = useState<boolean | null>(null); // null: not checked, true: correct, false: incorrect
  const [isTrackCorrect, setIsTrackCorrect] = useState<boolean | null>(null); // Similarly for track
  const [pointsEarned, setPointsEarned] = useState<number>(0); // Points earned for the current submission

  // State to prevent multiple submissions
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const lastTrackRef = useRef<string | null>(null);

  const [cumulativeScore, setCumulativeScore] = useState<number>(0);

  useEffect(() => {
    if (currentTrack && currentTrack.trackId !== lastTrackRef.current) {
      console.log("Answer: New track detected, preserving cumulative score...", {
        previousTrack: lastTrackRef.current,
        newTrack: currentTrack.trackId,
      });
  
      // Reset only necessary states
      setArtistName("");
      setSongName("");
      setIsArtistCorrect(null);
      setIsTrackCorrect(null);
      setHasSubmitted(false);
      setFormLocked(false);
  
      // Update the reference for the current track
      lastTrackRef.current = currentTrack.trackId;
    }
  }, [currentTrack]);
  
  
  

  // Effect to lock form when submitting answer
  useEffect(() => {
    if (hasSubmitted) {
      setFormLocked(true);
    }
  }, [hasSubmitted]);

  useEffect(() => {
    async function fetchAnswerData() {
      try {
        const response = await fetch(
            `${API_BASE_URL}/umbraco/delivery/api/v2/content/item/${locale}/answer`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch answer data");
        }

        const data = await response.json();
        setAnswerData(data.properties);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }

    fetchAnswerData();
  }, [locale]);

  useEffect(() => {
    if (debouncedArtistName) {
      if (isSelectingArtistRef.current) {
        isSelectingArtistRef.current = false;
        return;
      }
      searchArtists(debouncedArtistName);
    } else {
      setArtistResults([]);
      setArtistError(null);
    }
  }, [debouncedArtistName]);

  useEffect(() => {
    if (debouncedSongName) {
      if (isSelectingTrackRef.current) {
        isSelectingTrackRef.current = false;
        return;
      }
      searchTracks(debouncedSongName);
    } else {
      setTrackResults([]);
      setTrackError(null);
    }
  }, [debouncedSongName]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // For Artist
      if (
          artistDropdownRef.current &&
          !artistDropdownRef.current.contains(target) &&
          artistInputRef.current &&
          !artistInputRef.current.contains(target)
      ) {
        setArtistResults([]);
      }

      // For Track
      if (
          trackDropdownRef.current &&
          !trackDropdownRef.current.contains(target) &&
          trackInputRef.current &&
          !trackInputRef.current.contains(target)
      ) {
        setTrackResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!answerData) return <p>Loading...</p>;

  const {
    artistFormLabel,
    artistFormPlaceholder,
    songFormLabel,
    songFormPlaceholder,
      answerHeading,
      answerMainText,
  } = answerData;

  // Function to search artists
  const searchArtists = async (query: string) => {
    setIsArtistLoading(true);
    setArtistError(null);

    try {
      const response = await fetch(
          `${API_BASE_URL}/api/spotify/artistname?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setArtistError("No artists found matching the query.");
          setArtistResults([]);
          return;
        }
        throw new Error("Failed to fetch artists.");
      }

      const data: Artist[] = await response.json();
      setArtistResults(data);
    } catch (err: any) {
      console.error("Error during artist search:", err);
      setArtistError(err.message || "An error occurred during the search.");
      setArtistResults([]);
    } finally {
      setIsArtistLoading(false);
    }
  };

  // Function to search tracks
  const searchTracks = async (query: string) => {
    setIsTrackLoading(true);
    setTrackError(null);

    try {
      const response = await fetch(
          `${API_BASE_URL}/api/spotify/trackname?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setTrackError("No tracks found matching the query.");
          setTrackResults([]);
          return;
        }
        throw new Error("Failed to fetch tracks.");
      }

      const data: Track[] = await response.json();
      setTrackResults(data);
    } catch (err: any) {
      console.error("Error during track search:", err);
      setTrackError(err.message || "An error occurred during the search.");
      setTrackResults([]);
    } finally {
      setIsTrackLoading(false);
    }
  };

  // Selection Handlers
  const handleSelectArtist = (artist: Artist) => {
    isSelectingArtistRef.current = true;
    setArtistName(artist.name);
    setArtistResults([]);
  };

  const handleSelectTrack = (track: Track) => {
    isSelectingTrackRef.current = true;
    setSongName(track.name);
    setTrackResults([]);
  };

  const checkAnswer = () => {
    if (hasSubmitted || !currentTrack) return;

    let artistCorrect = false;
    let trackCorrect = false;
    let totalPoints = 0;

    const normalize = (str: string) => str.trim().toLowerCase();

    // Validate Artist
    if (artistName.trim() !== "") {
      const normalizedGuessedArtist = normalize(artistName);
      const isArtistNameMatch = normalize(currentTrack.artistName).includes(normalizedGuessedArtist);

      const selectedArtist = artistResults.find(
        (artist) => normalize(artist.name) === normalize(artistName)
      );
      const guessedArtistId = selectedArtist ? selectedArtist.id : null;

      if (guessedArtistId && currentTrack.artistIds.includes(guessedArtistId)) {
        artistCorrect = true;
        totalPoints += 1;
      } else if (isArtistNameMatch) {
        artistCorrect = true;
        totalPoints += 1;
      }
    }

    // Validate Track
    if (songName.trim() !== "") {
      const normalizedGuessedTrack = normalize(songName);
      const isTrackNameMatch = normalize(currentTrack.trackName).includes(normalizedGuessedTrack);

      const selectedTrack = trackResults.find(
        (track) => normalize(track.name) === normalize(songName)
      );
      const guessedTrackId = selectedTrack ? selectedTrack.id : null;

      if (guessedTrackId && currentTrack.trackId === guessedTrackId) {
        trackCorrect = true;
        totalPoints += 1;
      } else if (isTrackNameMatch) {
        trackCorrect = true;
        totalPoints += 1;
      }
    }

    setIsArtistCorrect(artistCorrect);
    setIsTrackCorrect(trackCorrect);

    // Update cumulative score and points for the current submission
    setCumulativeScore((prevScore) => prevScore + totalPoints);
    setPointsEarned((prevPoints) => prevPoints + totalPoints);

    setHasSubmitted(true);

    submitAnswer();

    // Submit points only if the user earned at least one point
    if (totalPoints >= 0) {
      submitPoints(totalPoints);
    }
  };
  
  
  const submitPoints = async (points: number) => {
    try {
      console.log("Submitting points:", points);
      const response = await fetch(
        `${API_BASE_URL}/api/game/${roomId}/submitPoints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            points: points,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to submit points.");
      }
  
      const data = await response.json();
      console.log("Points submitted successfully. Backend response:", data);
  
      // Update cumulative score based on backend response
      setCumulativeScore(data.updatedScore || cumulativeScore);
    } catch (error) {
      console.error("Error submitting points:", error);
    }
  };

  const submitAnswer = async () => {
    try {
      const response = await fetch(
          `${API_BASE_URL}/api/game/${roomId}/submitAnswer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
            }),
          }
      );

      if (!response.ok) {
        throw new Error("Failed to submit answer notification");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };
  
  
  


  return (
      <div className="flex flex-col justify-center mx-auto p-4">
        <div className="m-20 bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
          <h1 className="text-6xl font-bold mb-4 text-center bg-gradient-to-r from-green-dark via-green-mid to-green-dark bg-clip-text text-transparent">
            {answerHeading}
          </h1>
          <div
              className="text-zinc-300 leading-relaxed space-y-4 [&>p]:text-zinc-300 [&>ul]:text-zinc-300 [&>ol]:text-zinc-300"
              dangerouslySetInnerHTML={{ __html: answerMainText.markup }}
          />
        </div>
        {/* Artist Search Input */}
        <div className="relative mb-8">
          <label className="text-zinc-200 block font-bold mb-2">{artistFormLabel}</label>
          <input
              type="text"
              ref={artistInputRef}
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className={`w-full border-4 font-bold text-xl rounded-xl bg-gray-100 py-2 px-8 text-gray-500 text-center focus:outline-none focus:border-yellow-500 ${
                  formLocked ? "bg-gray-200 cursor-not-allowed" : artistName
                      ? "border-green-mid"
                      : "border-gray-400"
              }`}
              placeholder={artistFormPlaceholder}
              disabled={formLocked}
          />
          {artistError && <p className="text-red-500 mt-1">{artistError}</p>}
          {/* Artist Results Dropdown */}
          {artistResults.length > 0 && !hasSubmitted && (
              <ul
                  ref={artistDropdownRef}
                  className="absolute z-10 w-full bg-stone-900 border rounded mt-1 max-h-40 overflow-y-auto custom-scrollbar"
              >
                {artistResults.map((artist) => (
                    <li
                        key={artist.id}
                        className="cursor-pointer hover:bg-gray-700 p-2 flex items-center"
                        onClick={() => handleSelectArtist(artist)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleSelectArtist(artist);
                          }
                        }}
                    >
                      {artist.profileImageUrl ? (
                          <img
                              src={artist.profileImageUrl}
                              alt={artist.name}
                              width={32}
                              height={32}
                              className="rounded-full mr-2"
                          />
                      ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 mr-2 flex items-center justify-center">
                    <span className="text-white text-sm">
                      {artist.name.charAt(0)}
                    </span>
                          </div>
                      )}
                      <span className="text-white">{artist.name}</span>
                    </li>
                ))}
              </ul>
          )}
        </div>

        {/* Track Search Input */}
        <div className="relative mb-8">
          <label className="text-zinc-200 block font-bold mb-2">{songFormLabel}</label>
          <input
              type="text"
              ref={trackInputRef}
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              className={`w-full border-4 font-bold text-xl rounded-xl bg-gray-100 py-2 px-8 text-gray-500 text-center focus:outline-none focus:border-yellow-500 ${
                  formLocked ? "bg-gray-200 cursor-not-allowed" : songName
                      ? "border-green-mid"
                      : "border-gray-300"
              }`}
              placeholder={songFormPlaceholder}
              disabled={formLocked}
          />
          {trackError && <p className="text-red-500 mt-1">{trackError}</p>}
          {/* Track Results Dropdown */}
          {trackResults.length > 0 && !hasSubmitted && (
              <ul
                  ref={trackDropdownRef}
                  className="absolute z-10 w-full bg-stone-900 border rounded mt-1 max-h-40 overflow-y-auto custom-scrollbar"
              >
                {trackResults.map((track) => (
                    <li
                        key={track.id}
                        className="cursor-pointer hover:bg-gray-700 p-2 flex items-center"
                        onClick={() => handleSelectTrack(track)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleSelectTrack(track);
                          }
                        }}
                    >
                      {track.albumCoverUrl ? (
                          <img
                              src={track.albumCoverUrl}
                              alt={track.name}
                              width={32}
                              height={32}
                              className="rounded mr-2"
                          />
                      ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 mr-2 flex items-center justify-center">
                    <span className="text-white text-sm">
                      {track.name.charAt(0)}
                    </span>
                          </div>
                      )}
                      <div>
                        <span className="text-white">{track.name}</span>
                        <br />
                      </div>
                    </li>
                ))}
              </ul>
          )}
        </div>

        <button
            onClick={checkAnswer}
            disabled={formLocked}
            className={`text-center bg-green-mid font-bold text-xl rounded-xl text-white p-10 py-4 hover:text-white hover:bg-green-dark transition duration-200 ${
                formLocked ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          Submit Answer
        </button>
      </div>
  );
}

export default Answer;
