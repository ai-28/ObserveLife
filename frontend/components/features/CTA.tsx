'use client';

import { Button } from "@/components/ui/Button";

const CTA = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="relative rounded-3xl hero-bg overflow-hidden p-12 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Start Preserving Stories Today
            </h2>
            <p className="font-body text-lg text-primary-foreground/80 mb-8 leading-relaxed">
              Join forward-thinking senior living and hospice organizations who are
              transforming resident engagement and family connection with Observe Life.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
