'use client';

import { Check } from "lucide-react";

const roles = [
  {
    role: "Resident",
    tag: "Storyteller",
    scope: "Own story profile",
    capabilities: [
      "Record video, audio & text responses",
      "View family question queue",
      "Control story privacy & sharing",
      "Record hospice legacy content",
    ],
  },
  {
    role: "Family Member",
    tag: "Connected",
    scope: "Shared stories",
    capabilities: [
      "View stories shared by resident",
      "Submit questions to storyteller",
      "Receive notifications",
      "React to stories (Phase 2)",
    ],
  },
  {
    role: "Staff Facilitator",
    tag: "Facilitator",
    scope: "All residents in org",
    capabilities: [
      "View all resident profiles",
      "Manage pending questions",
      "Record on behalf of residents",
      "Access therapeutic prompt library",
    ],
  },
  {
    role: "Facility Admin",
    tag: "Administrator",
    scope: "All org data",
    capabilities: [
      "All facilitator permissions",
      "Manage staff accounts",
      "View facility-wide analytics",
      "Manage billing & census",
    ],
  },
  {
    role: "Platform Admin",
    tag: "Super Admin",
    scope: "All organizations",
    capabilities: [
      "Manage all facilities",
      "View platform-wide analytics",
      "Manage billing across organizations",
      "System configuration & settings",
    ],
  },
];

const Roles = () => {
  return (
    <section className="py-24 bg-card" id="roles">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-body text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
            User Roles
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The Right Access for Every Person
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            From residents recording their stories to facility admins managing
            billing — every role is purpose-built.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {roles.map((item) => (
            <div
              key={item.role}
              className="rounded-2xl bg-background p-6 border border-border/50 card-shadow"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">{item.role}</h3>
              </div>
              <span className="inline-block font-body text-xs font-semibold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full mb-3">
                {item.tag}
              </span>
              <p className="font-body text-xs text-muted-foreground mb-4">
                Scope: {item.scope}
              </p>
              <ul className="space-y-2">
                {item.capabilities.map((cap) => (
                  <li key={cap} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                    {cap}
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

export default Roles;
