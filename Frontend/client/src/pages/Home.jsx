import Navbar from "../components/Navbar";
import BrandIntro from "../components/BrandIntro";
import Hero from "../components/Hero";
import About from "../components/About";
import PrivacyTrust from "../components/PrivacyTrust";
import LegacyHeritage from "../components/LegacyHeritage";
import FounderTeam from "../components/FounderTeam";
import ProfileCarousel from "../components/ProfileCarousel";
import Features from "../components/Features";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-950 overflow-x-hidden">
      <Navbar />
      
      {/* Brand intro - fullscreen hero with only logo */}
      <BrandIntro />
      
      {/* Progressive scroll reveals for remaining sections */}
      <ScrollReveal direction="up" delay={0}>
        <Hero />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.1}>
        <About />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.1}>
        <Features />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.1}>
        <PrivacyTrust />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.1}>
        <ProfileCarousel />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.1}>
        <LegacyHeritage />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.1}>
        <FounderTeam />
      </ScrollReveal>
      

      
      <ScrollReveal direction="up" delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
