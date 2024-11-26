import LobbyContent from "../components/LobbyContent";

interface Params {
  locale: string;
}

async function fetchLobbyData(locale: string) {
  const response = await fetch(
    `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/lobby`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch lobby data, status: ${response.status}`);
  }

  const data = await response.json();
  return data.properties;
}

const Lobby = async ({ params }: { params: Params }) => {
  const locale = params.locale || "sv";
  let data;

  try {
    data = await fetchLobbyData(locale);
  } catch (error) {
    console.error(error);
    data = {
      topHeading: "Error",
      mainParagraph: "Error fetching lobby data.",
      buttonText: "Try Again",
    };
  }

  return (
    <div className="flex justify-center bg-stone-900 mt-56 max-w-xl mx-auto p-8 rounded-lg shadow-lg">
      <LobbyContent data={data} locale={locale} />
    </div>
  );
};

export default Lobby;
