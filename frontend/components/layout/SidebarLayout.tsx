'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Menu, 
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';

interface SidebarLayoutProps {
  children: React.ReactNode;
  role: 'platform_admin' | 'facility_admin' | 'staff';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export default function SidebarLayout({ children, role }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.data.user;
      setUser(userData);

      if (userData.organization_id) {
        const orgRes = await api.get(`/organizations/${userData.organization_id}`);
        setOrganization(orgRes.data.data.organization);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Define navigation items based on role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        label: 'Dashboard',
        href: role === 'platform_admin' ? '/platform-admin/dashboard' : role === 'facility_admin' ? '/admin/dashboard' : '/staff/dashboard',
        icon: LayoutDashboard,
      },
    ];

    if (role === 'platform_admin') {
      return [
        ...baseItems,
        {
          label: 'Organizations',
          href: '/platform-admin/organizations',
          icon: Users,
        },
        {
          label: 'Billing',
          href: '/platform-admin/billing',
          icon: CreditCard,
        },
      ];
    }

    if (role === 'facility_admin') {
      return [
        ...baseItems,
        {
          label: 'Billing',
          href: '/admin/billing',
          icon: CreditCard,
        },
      ];
    }

    // Staff facilitator
    return [
      ...baseItems,
      {
        label: 'Residents',
        href: '/staff/residents',
        icon: Users,
      },
    ];
  };

  const navItems = getNavItems();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const getTopBarTitle = () => {
    if (role === 'platform_admin') {
      return 'Platform Dashboard';
    } else if (role === 'facility_admin') {
      return 'Facility Dashboard';
    } else {
      return 'Staff Dashboard';
    }
  };

  return (
    <div className="max-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
        style={{ backgroundColor: '#1a2e2e' }}
      >
        {/* Sidebar Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => {
                  router.push('/');
                  setSidebarOpen(false);
                }}
                className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                <Image
                  src="/assets/logo2.PNG"
                  alt="Observe Life"
                  width={50}
                  height={50}
                  className="object-contain"
                />
                <span className="font-display text-xl font-bold text-white">
                  Observe Life
                </span>
              </button>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                     className={`
                       flex items-center gap-3 px-3 py-2
                       transition-colors duration-200
                       ${
                         active
                           ? 'text-white border-l-3'
                           : 'text-white/70 hover:bg-white/10 hover:text-white'
                       }
                     `}
                     style={active ? { backgroundColor: '#2a7f7f4d', borderLeftWidth: '3px', borderLeftColor: '#2a7f7f' } : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-body text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#D0D0D0]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-white/70 truncate">
                {role === 'platform_admin' ? 'Platform Admin' : role === 'facility_admin' ? 'Facility Admin' : 'Staff Facilitator'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header 
          className="hidden lg:block border-b border-[#D0D0D0] px-6 py-4 sticky top-0 z-30"
          style={{ backgroundColor: '#1a5f5f' }}
        >
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-white">
              {getTopBarTitle()}
            </h1>
            <div className="flex items-center gap-4">
              {/* Add any top bar actions here */}
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden bg-background border-b border-[#D0D0D0] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-display text-2xl font-bold text-white">
            Observe<span className="text-2xl text-secondary"> Life</span>
          </h1>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f4f4f4]">
          {children}
        </main>
      </div>
    </div>
  );
}
