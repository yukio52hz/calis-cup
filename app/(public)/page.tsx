import { Hero } from "./_components/hero";
import {
  Faq,
  FinalCta,
  Footer,
  HowItWorks,
  Registration,
  Tournament,
} from "./_components/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Tournament />
      <Registration />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
