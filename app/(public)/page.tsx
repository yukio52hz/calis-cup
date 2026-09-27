import { getPublicTournamentInfo } from "@/features/tournaments/server/public-info";

import { Hero } from "./_components/hero";
import {
  Faq,
  FinalCta,
  Footer,
  HowItWorks,
  Registration,
  Tournament,
} from "./_components/sections";

export default async function Home() {
  const info = await getPublicTournamentInfo();

  return (
    <>
      <Hero info={info} />
      <HowItWorks />
      <Tournament info={info} />
      <Registration info={info} />
      <Faq info={info} />
      <FinalCta />
      <Footer />
    </>
  );
}
