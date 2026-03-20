'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/Button';

export const ConditionalNavbar = () => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [pathname]);

  // Public pages where navbar should show
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(pathname || '');

  // Don't show navbar on authenticated pages
  if (isAuthenticated || !isPublicPage) {
    return null;
  }

  return (
    <nav className="bg-teal-dark text-white px-6 py-3 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="font-display text-lg font-bold">
          Observe Life
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="secondary" size="sm" className="bg-white/10 border-white/25 text-white hover:bg-white hover:text-teal-dark">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
