

interface Params {
  locale: string;
}

export default async function Home({ params }: { params: Params }) {
  let res;

  const locale = params?.locale || "sv";

  try {
    const response = await fetch(
      `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Could not fetch! status: ${response.status}`);
    }

    res = await response.json();
    console.log("API response:", res);
  } catch (error) {
    console.error("Fetch error:", error);
    return <p>Error fetching data...</p>;
  }

  const { properties } = res;
  const {
    heading,
    topSubHeading,
    mainParagraph,
    botSubHeading,
    buttons,
    logInButton,
  } = properties;

  const image = res.properties.backgroundImg && res.properties.backgroundImg[0];
  const imageUrl =
    image && image.url
      ? image.url.startsWith("/")
        ? `https://quizify.azurewebsites.net${image.url}`
        : image.url
      : null;

  const simplifiedButtons =
    buttons?.items?.map(
      (item: {
        content: {
          properties: {
            buttonText: string;
            buttonUrl: string;
            buttonStyle: string;
          };
        };
      }) => ({
        buttonText: item.content.properties.buttonText,
        buttonUrl: item.content.properties.buttonUrl,
        buttonStyle: item.content.properties.buttonStyle,
      })
    ) || [];

  return (
    <section>
      <div className="mt-20 bg-stone-900 max-w-xl mx-auto p-8 rounded-lg shadow-lg">
        <div className="flex flex-col justify-center items-center font-bold mt-4 mb-32">
          <h2 className="text-zinc-200 flex flex-col justify-center items-center font-bold mt-4">
            {topSubHeading.toUpperCase()}
            <span className="mb-10 text-6xl bg-gradient-to-r from-green-dark via-green-mid to-green-dark bg-clip-text text-transparent font-bold  ml-2">
              {heading ? heading.toUpperCase() : ""}
            </span>
          </h2>
        </div>

        <div
          style={{ backgroundImage: `url()` }}
          className="bg-cover bg-center bg-no-repeat w-[85%] h-[300px] mt-5 flex flex-col justify-center rounded-3xl mx-auto"
        >
          <div className="flex flex-col justify-center items-center font-bold mt-4">
            <div className="w-full max-w-2xl ">
              <p
                className="text-xl text-zinc-200 text-center m-2 mb-10 py-2 break-words"
                style={{
                  textShadow:
                    "1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black",
                }}
              >
                {mainParagraph.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-zinc-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
            <a
              className={`text-center bg-green-mid font-bold text-xl rounded-xl text-white my-6 py-4 hover:text-white hover:bg-green-dark transition duration-200 ${simplifiedButtons[0].buttonStyle}`}
              href={simplifiedButtons[0].buttonUrl}
              aria-label={`Navigate to ${simplifiedButtons[0].buttonText} page`}
            >
              {simplifiedButtons[0].buttonText.toUpperCase()}
            </a>
            <a
              className={`text-center bg-white font-bold text-xl rounded-xl text-green-mid my-6 py-4 hover:text-white hover:bg-green-dark transition duration-200 ${simplifiedButtons[1].buttonStyle}`}
              href={simplifiedButtons[1].buttonUrl}
              aria-label={`Navigate to ${simplifiedButtons[1].buttonText} page`}
            >
              {simplifiedButtons[1].buttonText.toUpperCase()}
            </a>
            <a className={`text-center bg-gradient-to-r from-green-dark via-green-mid to-green-dark font-bold text-xl rounded-xl text-white my-6 py-4 hover:text-black transition duration-200 ${simplifiedButtons[2].buttonStyle}`} href={simplifiedButtons[2].buttonUrl}>
              {simplifiedButtons[2].buttonText.toUpperCase()}
            </a>
          </div>
        </div>
        <div className="mb-96"></div>
        {/*
        <div className="flex flex-col content-center items-center">
          <h1 className="font-bold text-center mt-20 text-4xl mb-5">
            {botSubHeading.toUpperCase()}
          </h1>
          <a className={`cursor-pointer font-bold px-2 rounded-md py-1 m-4 hover:scale-110 transition-transform duration-200 ${simplifiedButtons[2].buttonStyle}`} href={simplifiedButtons[2].buttonUrl}>
            {simplifiedButtons[2].buttonText.toUpperCase()}
          </a>
            <a className={`cursor-pointer font-bold px-2 rounded-md py-1 m-4 hover:scale-110 transition-transform duration-200 ${simplifiedButtons[3].buttonStyle}`} href={simplifiedButtons[3].buttonUrl}>
              {simplifiedButtons[3].buttonText.toUpperCase()}
            </a>
        </div>
        */}
      </div>
    </section>
  );
}
