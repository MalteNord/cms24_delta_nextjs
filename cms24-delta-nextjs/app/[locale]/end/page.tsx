import EndContent from "../components/EndContent";


interface PageProps {
  searchParams: {
    roomId?: string;
    players?: string;
    scores?: string;
  };
  params: {
    locale: string;
  };
}

const fetchEndgameData = async (locale: string) => {
  try {
    const response = await fetch(
      `http://localhost:39457/umbraco/delivery/api/v2/content/item/${locale}/end`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    return res.properties || {};
  } catch (error) {
    console.error("Error fetching endgame data:", error);
    return {};
  }
};

export default async function EndPage({ searchParams, params }: PageProps) {
  const { roomId = "", players = "[]", scores = "{}", locale = "sv" } = {
    ...searchParams,
    ...params,
  };

  const properties = await fetchEndgameData(locale);

  return (
    <EndContent
      heading={properties.heading || "Game Over"}
      subHeading={properties.subHeading || "Thank you for playing!"}
      subText={properties.subText || "Here are the final results:"}
      links={properties.links || []}
      players={JSON.parse(decodeURIComponent(players))}
      scores={JSON.parse(decodeURIComponent(scores))}
      roomId={roomId}
      locale={locale}
    />
  );
}
