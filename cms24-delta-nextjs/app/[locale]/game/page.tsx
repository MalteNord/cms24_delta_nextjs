import GameContent from "../components/GameContent";

interface Params {
    locale: string;
}

export default function GamePage({ params }: { params: Params }) {
    return <GameContent locale={params.locale || "sv"} />;
}