'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card } from '@/components/ui/Card';

export default function PlatformAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    organizations: 0,
    totalResidents: 0,
    totalStories: 0,
    totalRevenue: 0,
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      const userData = userRes.data.data.user;
      setUser(userData);

      if (userData.role !== 'platform_admin') {
        router.push('/login');
        return;
      }

      // Get all organizations
      const orgsRes = await api.get('/organizations');
      const orgs = orgsRes.data.data.organizations || [];
      setStats((prev) => ({ ...prev, organizations: orgs.length }));

      // TODO: Calculate total residents, stories, revenue across all organizations
      setStats((prev) => ({
        ...prev,
        totalResidents: 0,
        totalStories: 0,
        totalRevenue: 0,
      }));
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout role="platform_admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-semibold text-muted-foreground">Loading...</div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role="platform_admin">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p className="text-muted-foreground">Overview of all organizations and platform metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Organizations</div>
            <div className="text-3xl font-bold text-primary">{stats.organizations}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Residents</div>
            <div className="text-3xl font-bold text-primary">{stats.totalResidents}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Stories</div>
            <div className="text-3xl font-bold text-primary">{stats.totalStories}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-green">${stats.totalRevenue.toLocaleString()}</div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="text-muted-foreground text-center py-8">
            Activity feed coming soon...
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
