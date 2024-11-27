import CreateGame from "../components/CreateGame";
import JoinGame from "../components/JoinGame";

interface Params {
  locale: string;
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export default async function Quiz({ params }: { params: Params }) {
  let res;

  const locale = params.locale || "sv";

  try {
    const response = await fetch(
      `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/quiz`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Await the JSON data
    res = await response.json();
    console.log("API response:", res);
  } catch (error) {
    console.error("Fetch error:", error);
    return <h1>Error fetching data!</h1>;
  }

  const { properties } = res;
  const { heading, subtitle, createGameText } = properties;

  return (
    <div className="mt-24 bg-stone-900 max-w-xl mx-auto p-8 rounded-lg shadow-lg">

    <div className="flex justify-center">
      <h1 className="inline-flex mt-10 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-dark via-green-mid to-green-dark">{heading}</h1>
    </div>


      <p className="text-zinc-200 flex justify-center mt-2 font-bold mb-20 text-xl">{subtitle}</p>

      <div className="flex justify-center">
        <CreateGame params={params} />
      </div>
      <div className="flex justify-center mt-10">
        <JoinGame params={params} />
      </div>
      <div className="mb-96"></div>
    </div>
  );
}
