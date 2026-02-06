import { MorphingHeader } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { WhatWeOptimize } from '@/components/WhatWeOptimize';
import { AdaptationPreview } from '@/components/AdaptationPreview';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';

const Index = () => {
  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <MorphingHeader />
      
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <WhatWeOptimize />
        <AdaptationPreview />
        <FAQ />
        <FinalCTA />
      </main>
    </div>
  );
};

export default Index;
