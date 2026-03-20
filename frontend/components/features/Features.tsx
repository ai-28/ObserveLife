'use client';
import {
  Building2,
  Heart,
  Brain,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Institutional Layer",
    description:
      "Purpose-built for SNF, Assisted Living, and Hospice facilities with facility-level admin, staff roles, and resident management.",
  },
  {
    icon: Heart,
    title: "Hospice Legacy Recording",
    description:
      "Simplified bedside interface with large buttons and low-energy workflows for end-of-life storytelling — gratitude, family messages, and wisdom.",
  },
  {
    icon: Brain,
    title: "Therapeutic Prompt Library",
    description:
      "Curated prompt sets for OT, SLP, and RT therapists — organized by therapy type for cognitive stimulation and reminiscence therapy.",
  },
  {
    icon: ShieldCheck,
    title: "Consent & Compliance",
    description:
      "Digital consent capture at enrollment with capacity-aware workflows. Legal representatives can authorize on behalf of residents.",
  },
  {
    icon: Users,
    title: "Staff & Family Dashboards",
    description:
      "Facilitators see residents, pending questions, and activity. Family admins manage access. Facility admins track engagement and billing.",
  },
  {
    icon: BarChart3,
    title: "Per-Resident Billing",
    description:
      "Transparent pricing at $10/SNF, $8/AL, $15/Hospice per resident per month. Automated billing tied to your census count.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-card" id="features">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-body text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built for Institutions, Loved by Families
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            Everything your facility needs to preserve resident stories, engage
            families, and support therapeutic outcomes — all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-background p-8 card-shadow hover:shadow-lg transition-all duration-300 border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
