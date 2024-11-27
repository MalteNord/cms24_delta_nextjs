import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, StreamInvocationMessage } from '@microsoft/signalr';

interface Player {
  userId: string;
  name: string;
  host: boolean;
}

export const createSignalRConnection = async (
  roomId: string,
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnection: React.Dispatch<React.SetStateAction<HubConnection | null>>,
  onStartGame: () => void
) => {
  let newConnection: HubConnection | undefined;
  let hasFetchedPlayers = false;

  setConnecting(true);

  newConnection = new HubConnectionBuilder()
    .withUrl(`https://quizify.azurewebsites.net/lobbyHub?roomId=${roomId}`, {
      transport: HttpTransportType.WebSockets,
      withCredentials: true,
      skipNegotiation: true
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(LogLevel.Debug)
    .build();

  newConnection.on('ReceivePlayers', (players: Player[]) => setPlayers(players));
  // newConnection.on('PlayerJoined', (playerName: string) => setPlayers((prev) => [...prev, playerName]));

  newConnection.on("StartGame", onStartGame);

  newConnection.onclose(() => {
    setConnecting(false);
    hasFetchedPlayers = false;
  });

  try {
    await newConnection.start();
    setConnection(newConnection);

    if (!hasFetchedPlayers && roomId) {
      await newConnection.invoke('FetchPlayersInRoom', roomId);
      hasFetchedPlayers = true;
    }
  } catch (error) {
    console.error('SignalR Connection Error:', error);
  } finally {
    setConnecting(false);
  }

  return newConnection;
};
