'use client';

import { Button } from "@/components/ui/Button";
import heroImage from "@/assets/hero-family.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--hero-overlay)' }} />

      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 font-body text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            For Senior Living & Hospice Organizations
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white tracking-tight">
            Every Life Has a Story{" "}
            <span className="text-white/90">Worth Preserving</span>
          </h1>

          <p className="font-body text-lg text-white/90 max-w-lg leading-relaxed">
            Observe Life empowers senior living facilities, hospice organizations,
            and therapy departments to capture, preserve, and share the stories
            of residents — connecting generations through video, audio, and the
            power of a single question.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="hero-outline"
              size="lg"
              className="text-base px-8 py-6 text-white border-white/40 hover:bg-white/10 hover:border-white/60"
            >
              <a href="#how-it-works" className="text-base px-8 py-6 text-white">
                Watch How It Works
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-4 font-body text-sm text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              2-Minute Setup
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              No Training Required
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-secondary/20 blur-2xl" />
              <img
                src={heroImage.src as string}
                alt="Elderly grandmother sharing stories with family in a warm setting"
                className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="rounded-xl bg-white p-4 font-body shadow-lg">
              <p className="text-gray-700 text-sm italic">
                "Mom told us a story about her childhood farm we'd never heard before.
                Now it's preserved forever."
              </p>
              <p className="text-gray-600 text-xs mt-1 font-semibold">— Sarah M., Family Member</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
