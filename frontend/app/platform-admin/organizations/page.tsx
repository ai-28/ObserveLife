'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PlatformAdminOrganizations() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      const user = userRes.data.data.user;

      if (user.role !== 'platform_admin') {
        router.push('/login');
        return;
      }

      const orgsRes = await api.get('/organizations');
      setOrganizations(orgsRes.data.data.organizations || []);
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Organizations</h1>
            <p className="text-muted-foreground">Manage all facilities and organizations</p>
          </div>
          <Button onClick={() => router.push('/platform-admin/organizations/new')}>
            + Add Organization
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.length === 0 ? (
            <Card className="p-8 text-center col-span-full">
              <p className="text-muted-foreground">No organizations yet</p>
            </Card>
          ) : (
            organizations.map((org) => (
              <Card key={org.id} className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">{org.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <p>Type: {org.type}</p>
                  <p>Residents: {org.residents_count || 0}</p>
                  <p>Status: {org.billing_status}</p>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push(`/platform-admin/organizations/${org.id}`)}
                >
                  View Details
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
