export const fetchPlayerRole = async (
  roomId: string,
  userId: string,
  setIsHost: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const response = await fetch(
      `https://quizify.azurewebsites.net/api/game/${roomId}/player?userId=${userId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error: ${response.status} - ${errorMessage}`);
    }

    const playerData = await response.json();
    setIsHost(playerData.isHost);
  } catch (error) {
    console.error('Error fetching player role:', error);
    setError('Unable to load game data.');
  } finally {
    setLoading(false);
  }
};
