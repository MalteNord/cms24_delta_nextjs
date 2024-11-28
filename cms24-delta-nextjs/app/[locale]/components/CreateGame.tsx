"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import Cookies from "js-cookie";


interface Params {
  locale: string;
}

function CreateGame({ params }: { params: Params }) {
  const locale = params.locale || "sv";
  const [quizData, setQuizData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter();

  useEffect(() => {

    const accessToken = Cookies.get('spotify_access_token');
    setIsAuthenticated(!!accessToken);


    async function fetchQuizData() {
      const response = await fetch(
        `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/quiz`
      );
      const data = await response.json();
      setQuizData(data.properties);
    }
    fetchQuizData();
  }, [locale]);

  if (!quizData) return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid"></div>

  const { formTextName, placeholderTextName, button, loginButton } = quizData;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const playerName = formData.get("name")?.toString();
    const userId = uuidv4();

    const payload = { playerName, userId, host: true };

    try {
      const response = await fetch("https://quizify.azurewebsites.net/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== "undefined" && playerName) {
          localStorage.setItem("playerName", playerName);
        }
        router.push(`/${locale}/lobby?roomId=${data.roomId}&userId=${userId}`);
      } else {
        const errorData = await response.json();
        console.error("Error creating room:", errorData);
        alert(`Failed to create room: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error in request:", error);
      alert("An error occurred while creating the room.");
    }
  };


  if (!isAuthenticated) {
    return (
        <div className="flex flex-col items-center mt-9">
          {/* Text above the button */}
          <span className="mb-4 text-zinc-200 text-lg text-center">{loginButton}</span>
          <a
              href="https://quizify.azurewebsites.net/api/spotify/login"
              className="flex items-center justify-center w-full max-w-xs px-4 py-2 bg-stone-800 hover:bg-stone-600 rounded-lg shadow-md transform transition-all duration-200"
          >
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
                alt="spotify-logo"
                className="w-28 mr-2 p-1"
            />
          </a>
        </div>
    );
  }

  return (
      <div>
        <form className="grid justify-center" onSubmit={handleSubmit}>
          <label className="text-zinc-200 grid justify-center mt-5 font-bold">
            {formTextName}:
            <input
                className="w-full border-4 font-bold text-xl rounded-xl bg-gray-100 py-2 px-8 text-gray-500 text-center focus:outline-none focus:border-green-mid"
                type="text"
                name="name"
                placeholder={placeholderTextName}
                required
            />
          </label>
          <button className="h-14 bg-green-dark font-bold text-xl rounded-xl text-white my-6 py-0 hover:text-white hover:bg-green-mid transition duration-200" type="submit">
            {button}
          </button>
        </form>
      </div>
  );
}

export default CreateGame;
