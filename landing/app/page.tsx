import { SiteHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Story } from "@/components/landing/story";
import { RecoveryLoop } from "@/components/landing/recovery-loop";
import { EvidenceLevels } from "@/components/landing/evidence-levels";
import { AgentGrid } from "@/components/landing/agent-grid";
import { Privacy, FinalCta, Footer } from "@/components/landing/closing";
import { SmoothScroll } from "@/components/brand/smooth-scroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Story />
        <RecoveryLoop />
        <EvidenceLevels />
        <AgentGrid />
        <Privacy />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
