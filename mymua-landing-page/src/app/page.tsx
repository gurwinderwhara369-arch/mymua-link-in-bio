import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import TrustBar from "@/components/trust-bar";
import ProblemSection from "@/components/problem-section";
import SolutionSection from "@/components/solution-section";
import TemplateSwapSection from "@/components/template-swap-section";
import TemplateGallery from "@/components/template-gallery";
import Pricing from "@/components/pricing";
import FAQ from "@/components/faq";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-cream overflow-hidden">
      <Navbar />

      <Hero />

      <TrustBar />

      <ProblemSection />

      <section id="features">
        <SolutionSection />
      </section>

      <section id="templates">
        <TemplateSwapSection />
        <TemplateGallery />
      </section>

      <section id="pricing">
        <Pricing />
      </section>

      <section id="faq">
        <FAQ />
      </section>

      <CTASection />

      <Footer />
    </main>
  );
}
