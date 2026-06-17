import { CommunityImpact } from "@/components/sections/home/community-impact";
import { CurrentWork } from "@/components/sections/home/current-work";
import { GetInvolved } from "@/components/sections/home/get-involved";
import { Hero } from "@/components/sections/home/hero";
import { LatestContent } from "@/components/sections/home/latest-content";
import { Mission } from "@/components/sections/home/mission";

export default function Home() {
  return (
    <>
      <Hero />
      <Mission />
      <CurrentWork />
      <LatestContent />
      <CommunityImpact />
      <GetInvolved />
    </>
  );
}