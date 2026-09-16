import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureStrip from "@/components/FeatureStrip";
import HowItWorks from "@/components/HowItWorks";
import Workshops from "@/components/Workshops";
import TutorsShowcase from "@/components/TutorsShowcase";
import TeacherApplySection from "@/components/TeacherApplySection";
import FAQSection from "@/components/FAQSection";
import NewRequestCTA from "@/components/NewRequestCTA";
import About from "@/components/About";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream font-arabic">
      <Navbar />
      <Hero />
      <FeatureStrip />
      <HowItWorks />
      <Workshops />
      <TutorsShowcase />
      <TeacherApplySection />
      <FAQSection />
      <NewRequestCTA />
      <About />
    </main>
  );
}
