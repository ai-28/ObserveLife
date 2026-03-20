'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { MenuIcon, XIcon } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const links = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Roles", href: "#roles" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="container flex items-center justify-between h-16">
        <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/assets/logo.PNG"
            alt="Observe Life"
            width={120}
            height={40}
            className="object-contain"
          />
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm text-white hover:text-secondary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button variant="hero" size="sm" onClick={() => router.push("/login")}>
            Login
          </Button>
        </div>

        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10 py-4">
          <div className="container flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button variant="hero" size="sm" className="w-fit" onClick={() => router.push("/login")}>
              Login
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
