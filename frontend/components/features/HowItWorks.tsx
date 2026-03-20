'use client';

import { MessageCircleQuestion, Video, Share2 } from "lucide-react";

const steps = [
  {
    icon: MessageCircleQuestion,
    title: "Family Asks a Question",
    description:
      "A daughter, grandson, or niece submits a question they've always wanted answered — 'What was your first job?' or 'Tell me about grandpa.'",
  },
  {
    icon: Video,
    title: "Storyteller Records",
    description:
      "The resident sees the question in their queue and records a video, audio, or text response — guided by staff or independently.",
  },
  {
    icon: Share2,
    title: "Story Is Shared & Preserved",
    description:
      "The family receives a notification, watches the answer, and the story is archived forever. The cycle continues with a new question.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background" id="how-it-works">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-body text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            One Question Starts a Lifetime of Stories
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            The Q&A Engine is the heart of Observe Life — transforming passive archives
            into living conversations between generations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-border" />

          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-6 ring-4 ring-background relative z-10">
                <step.icon className="w-7 h-7" />
              </div>
              <div className="absolute -top-2 -right-2 md:right-auto md:left-1/2 md:ml-6 md:-top-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-xs font-bold">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
