import HeroSection from "../components/sections/HeroSection";
import StatsSection from "../components/sections/StatsSection";
import FeaturedIdeasSection from "../components/sections/FeaturedIdeasSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import TestimonialSection from "../components/sections/TestimonialSection";
import FaqSection from "../components/sections/FaqSection";
import NewsletterSection from "../components/sections/NewsletterSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="grow">
        <HeroSection />
        <StatsSection />
        <FeaturedIdeasSection />
        <HowItWorksSection />
        <TestimonialSection />
        <FaqSection />
        <NewsletterSection />
      </main>
    </div>
  );
}
