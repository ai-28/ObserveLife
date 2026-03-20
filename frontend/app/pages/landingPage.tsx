import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/features/Hero";
import HowItWorks from "@/components/features/HowItWorks";
import Features from "@/components/features/Features";
import Roles from "@/components/features/Roles";
import Pricing from "@/components/features/Pricing";
import CTA from "@/components/features/CTA";
import Footer from "@/components/features/Footer";

const LandingPage = () => {
  return (
    <div className="max-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Roles />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
