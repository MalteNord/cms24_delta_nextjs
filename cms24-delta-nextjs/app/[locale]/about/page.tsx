import ContactForm from "../components/ContactForm";

interface Params {
  locale: string;
}

interface TextContent {
  markup: string;
  blocks: any[];
}

interface Properties {
  title: string;
  sectionTitle1: string;
  sectionText1: TextContent;
  sectionTitle2: string;
  sectionText2: TextContent;
  sectionTitle3: string;
  sectionText3: TextContent;
  contact: string;
}

interface ApiResponse {
  properties: Properties;
}

export default async function About({ params }: { params: Params }) {
  let res: ApiResponse;

  const locale = params.locale || "sv";

  try {
    const response = await fetch(
      `https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/about`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    res = await response.json();
    console.log("API response:", res);
  } catch (error) {
    console.error("Fetch error:", error);
    return <h1>Error fetching data!</h1>;
  }

  const {
    title,
    sectionTitle1,
    sectionText1,
    sectionTitle2,
    sectionText2,
    sectionTitle3,
    sectionText3,
    contact,
  } = res.properties;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-12 text-green-mid">
        {title}
      </h1>
      <div className="space-y-8">
        <div className="bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
          <h2 className="text-2xl font-semibold mb-4 text-center text-green-mid">
            {sectionTitle1}
          </h2>
          <div
            className="text-zinc-300 leading-relaxed space-y-4 [&>p]:text-zinc-300 [&>ul]:text-zinc-300 [&>ol]:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: sectionText1.markup }}
          />
        </div>
        <div className="bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
          <h2 className="text-2xl font-semibold mb-4 text-center text-green-mid">
            {sectionTitle2}
          </h2>
          <div
            className="text-zinc-300 leading-relaxed space-y-4 [&>p]:text-zinc-300 [&>ul]:text-zinc-300 [&>ol]:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: sectionText2.markup }}
          />
        </div>
        <div className="bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
          <h2 className="text-2xl font-semibold mb-4 text-center text-green-mid">
            {sectionTitle3}
          </h2>
          <div
            className="text-zinc-300 leading-relaxed space-y-4 [&>p]:text-zinc-300 [&>ul]:text-zinc-300 [&>ol]:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: sectionText3.markup }}
          />
        </div>

        {/* Form */}
        <div className="flex align-center flex-col mt-1">
          <h2 className="text-4xl text-zinc-200 font-bold text-center">{contact}</h2>
          <div className="w-[600px] bg-black m-7 rounded-xl mx-auto">
            {/* Om ContactForm är en komponent som fungerar utan client-sidan, kan den inkluderas direkt */}
            <ContactForm locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
