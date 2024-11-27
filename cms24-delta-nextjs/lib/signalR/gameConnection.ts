import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';

interface Player {
  userId: string;
  name: string;
  host: boolean;
}

interface GameConnectionOptions {
  locale: string;
  onGameEnd: (endGameData: { players: Player[]; scores: Record<string, number> }) => void;
}

export const createGameConnection = async (
  roomId: string,
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnection: React.Dispatch<React.SetStateAction<HubConnection | null>>,
  options: GameConnectionOptions
) => {
  let newConnection: HubConnection | undefined;
  let hasFetchedPlayers = false;

  setConnecting(true);

  newConnection = new HubConnectionBuilder()
    .withUrl(`https://quizify.azurewebsites.net/gameHub?roomId=${encodeURIComponent(roomId)}`, {
      transport: HttpTransportType.WebSockets,
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(LogLevel.Debug)
    .build();


  newConnection.on('ReceivePlayers', (players: Player[]) => {
    console.log('Players received:', players);
    setPlayers(players || []);
  });


  newConnection.on("ReceiveScores", (scores: Record<string, number>) => {
    console.log("Scores received:", scores);
    setScores(scores); // Initialize with the received scores
  });
  
  
  newConnection.on("ReceiveUpdatedScores", (updatedScores: Record<string, number>) => {
    console.log("Updated scores received:", updatedScores);
  
    // Merge new scores by adding them to the existing ones
    setScores((prevScores) => {
      const newScores = { ...prevScores };
      for (const [player, points] of Object.entries(updatedScores)) {
        newScores[player] = (newScores[player] || 0) + points;
      }
      return newScores;
    });
  });





  newConnection.on("ReceivePlayerSubmission", (playerName: string) => {
    console.log("Player submitted answer:", playerName);
    // The Scoreboard component will handle this event to show the checkmark
  });

  newConnection.on('OnTrackChanged', (trackInfoStr: string) => {
    try {

      console.log("Client: Received track change notification.", /*trackInfoStr*/);

    } catch (error) {
      console.error("Client: Error handling track change:", error);
    }
  });

  newConnection.on('GameEnded', (endGameData: { players: Player[]; scores: Record<string, number> }) => {
    console.log('Game ended event received:', endGameData);
  
  
    const url = `/${options.locale}/end?roomId=${encodeURIComponent(roomId)}&players=${encodeURIComponent(JSON.stringify(endGameData.players))}&scores=${encodeURIComponent(JSON.stringify(endGameData.scores))}`;
    console.log("Redirecting all players to URL:", url);
  
    options.onGameEnd(endGameData);
  });

  newConnection.onclose(() => {
    console.warn('GameHub connection closed.');
    setConnecting(false);
  });

  try {
    console.log('Connecting to GameHub...');
    await newConnection.start();
    console.log('Connected to GameHub');
    setConnection(newConnection);


    if (!hasFetchedPlayers && roomId) {
      await newConnection.invoke('FetchPlayersInRoom', roomId);
      console.log('Initial players fetched.');

      await newConnection.invoke('FetchScores', roomId);
      console.log('Initial scores fetched.');

      hasFetchedPlayers = true;
    }
  } catch (error) {
    console.error('Error connecting to GameHub:', error);
  } finally {
    setConnecting(false);
  }

  return newConnection;
};
