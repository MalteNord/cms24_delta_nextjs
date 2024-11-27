import CookieDeclaration from "@/app/[locale]/components/CookieDeclaration";

interface Params {
    locale: string;
}

interface TextContent {
    markup: string;
    blocks: any[];
}

interface Properties {
    heading: string;
    playerHeading: string;
    playerText: TextContent;
    hostHeading: string;
    hostText: TextContent;
    spotifyText: TextContent;
    subHeading: string;
}

interface ApiResponse {
    properties: Properties;
}

export default async function HowToPlay({ params }: { params: Params }) {
    let res: ApiResponse;

    const locale = params.locale || "sv";

    try {
        const response = await fetch(`https://quizify.azurewebsites.net/umbraco/delivery/api/v2/content/item/${locale}/howtoplay`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        res = await response.json();
        console.log('API response:', res);
    } catch (error) {
        console.error('Fetch error:', error);
        return <h1>Error fetching data!</h1>;
    }

    const { properties } = res;
    const { heading, playerHeading, playerText, hostHeading, hostText, spotifyText, subHeading } = properties;

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-center mb-12 text-green-mid">
                {heading}
            </h1>

            <div className="space-y-8">
                <div className="bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-green-mid">
                        {playerHeading}
                    </h2>
                    <div
                        className="text-zinc-300 leading-relaxed space-y-4 [&>p]:text-zinc-300 [&>ul]:text-zinc-300 [&>ol]:text-zinc-300"
                        dangerouslySetInnerHTML={{ __html: playerText.markup }}
                    />
                </div>

                <div className="bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-green-mid">
                        {hostHeading}
                    </h2>
                    <div
                        className="text-zinc-300 leading-relaxed space-y-4 [&>p]:text-zinc-300 [&>ul]:text-zinc-300 [&>ol]:text-zinc-300"
                        dangerouslySetInnerHTML={{ __html: hostText.markup }}
                    />
                </div>
                <div className="bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-green-mid">
                        {subHeading}
                    </h2>
                    <div
                        className="text-zinc-300 leading-relaxed space-y-4 [&>p]:text-zinc-300 [&>ul]:text-zinc-300 [&>ol]:text-zinc-300"
                        dangerouslySetInnerHTML={{ __html: spotifyText.markup }}
                    />
                </div>
                <div className="bg-stone-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-zinc-700">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-green-mid">
                        Cookies
                    </h2>
                    <CookieDeclaration  locale={locale}/>
                </div>
            </div>
        </div>
    );
}