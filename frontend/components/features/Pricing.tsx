'use client';
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Assisted Living",
    price: "$8",
    unit: "per resident / month",
    description: "For assisted living communities focused on family engagement and resident enrichment.",
    features: [
      "Resident story profiles",
      "Family Q&A engine",
      "Staff facilitator dashboard",
      "Consent capture & management",
      "Video, audio & text recording",
      "Family notifications",
      "Basic usage analytics",
    ],
    highlighted: false,
  },
  {
    name: "Skilled Nursing",
    price: "$10",
    unit: "per resident / month",
    description: "For SNF facilities integrating storytelling into therapeutic programs and activity planning.",
    features: [
      "Everything in Assisted Living",
      "Therapeutic prompt library (OT/SLP/RT)",
      "Story Night session support",
      "Advanced facility analytics",
      "Staff account management",
      "Admissions onboarding workflow",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Hospice",
    price: "$15",
    unit: "per resident / month",
    description: "For hospice organizations preserving end-of-life legacies with compassion and dignity.",
    features: [
      "Everything in Skilled Nursing",
      "Hospice legacy prompt library",
      "Bedside recording mode",
      "Time-locked milestone messages",
      "Capacity-aware consent workflows",
      "Legacy archive for families",
      "Dedicated onboarding support",
    ],
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 bg-background" id="pricing">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-body text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Per-Resident Pricing
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            No per-seat fees. No hidden costs. Pay only for enrolled residents.
            Family members connect for free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground border-primary scale-105 shadow-2xl"
                  : "bg-background border-border card-shadow hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold font-body px-4 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? "" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold font-display">{plan.price}</span>
                <span className={`font-body text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.unit}
                </span>
              </div>
              <p className={`font-body text-sm mb-6 leading-relaxed ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                className="w-full mb-6"
              >
                Get Started
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 font-body text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-secondary" : "text-secondary"}`} />
                    <span className={plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
