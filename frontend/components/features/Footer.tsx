const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold font-display mb-3">
              Observe<span className="text-secondary"> Life</span>
            </h3>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">
              Preserving the stories that matter most — one question at a time.
            </p>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold tracking-wider uppercase text-primary-foreground/40 mb-4">
              Platform
            </h4>
            <ul className="space-y-2 font-body text-sm text-primary-foreground/70">
              <li><a href="#features" className="hover:text-secondary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-secondary transition-colors">Pricing</a></li>
              <li><a href="#roles" className="hover:text-secondary transition-colors">User Roles</a></li>
              <li><a href="#how-it-works" className="hover:text-secondary transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold tracking-wider uppercase text-primary-foreground/40 mb-4">
              Solutions
            </h4>
            <ul className="space-y-2 font-body text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-secondary transition-colors">Skilled Nursing</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Assisted Living</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Hospice Care</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Therapy Departments</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold tracking-wider uppercase text-primary-foreground/40 mb-4">
              Company
            </h4>
            <ul className="space-y-2 font-body text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-secondary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-primary-foreground/40">
            © 2025 Observe Life. All rights reserved. Confidential.
          </p>
          <a href="https://observelife.com" className="font-body text-xs text-secondary hover:underline">
            observelife.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
