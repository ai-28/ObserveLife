'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const residentNavItems: NavItem[] = [
  { href: '/resident/home', icon: '🏠', label: 'Home' },
  { href: '/resident/record', icon: '🎥', label: 'Record' },
  { href: '/resident/questions', icon: '❓', label: 'Questions' },
  { href: '/resident/family', icon: '👥', label: 'Family' },
];

const familyNavItems: NavItem[] = [
  { href: '/family/home', icon: '🏠', label: 'Home' },
  { href: '/family/ask', icon: '❓', label: 'Ask' },
  { href: '/family/notifications', icon: '🔔', label: 'Alerts' },
  { href: '/family/profile', icon: '👤', label: 'Me' },
];

interface BottomNavProps {
  variant?: 'resident' | 'family';
}

export function BottomNav({ variant = 'resident' }: BottomNavProps) {
  const pathname = usePathname();
  const items = variant === 'resident' ? residentNavItems : familyNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 ${
                isActive ? 'text-teal' : 'text-gray'
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <div className="text-xs font-semibold">{item.label}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
