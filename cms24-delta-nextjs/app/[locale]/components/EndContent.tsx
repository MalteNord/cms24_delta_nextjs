'use client';

import Scoreboard from "./Scoreboard";

interface ScoreboardProps {
  lacle: string,
  userId: string
}

interface Player {
  userId: string;
  name: string;
  host: boolean;
}

interface EndContentProps {
  heading: string;
  subHeading: string;
  subText: string;
  links: Array<{ url: string; title: string; target?: string }>;
  players: Player[];
  scores: Record<string, number>;
  roomId: string;
  locale: string;
}

const EndContent = ({
  heading,
  subHeading,
  subText,
  links,
  players,
  scores,
  roomId,
  locale,
}: EndContentProps) => {
  return (
    <>
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl mt-10 text-transparent font-bold bg-gradient-to-r from-green-dark via-green-mid to-green-dark bg-clip-text mb-4">
        {heading}
      </h1>

      <p className="text-md text-white mb-2 px-28 text-center md:text-xl">{subHeading}</p>

      <div className="my-4">
        <Scoreboard roomId={roomId} locale={locale} currentUserId={""} currentUserName={""} />
      </div>

      <p className="text-center text-lg text-white mb-6 mt-6">{subText}</p>

      <div className="flex space-x-4">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            className="flex-1 text-center bg-green-mid font-bold text-lg rounded-xl text-white my-6 p-10 py-4 hover:text-white hover:bg-green-dark transition duration-200"
            target={link.target || "_self"}
            rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
          >
            {link.title}
          </a>
        ))}
      </div>
    </div>
    <div className="mb-96"></div>
    </>
  );
};

export default EndContent;
