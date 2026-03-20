'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StaffDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalResidents: 0,
    needsAttention: 0,
    totalStories: 0,
    familyAccounts: 0,
  });
  const [filter, setFilter] = useState<'all' | 'attention' | 'no-stories'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const residentsRes = await api.get('/residents');
      const allResidents = residentsRes.data.data.residents;
      setResidents(allResidents);

      // Calculate stats
      const storiesRes = await api.get('/stories');
      const stories = storiesRes.data.data.stories;

      const needsAttention = allResidents.filter((r: any) => {
        // Logic: last story > 30 days ago OR no stories OR pending questions > 2
        // Simplified for now
        return true; // TODO: Implement actual logic
      });

      setStats({
        totalResidents: allResidents.length,
        needsAttention: needsAttention.length,
        totalStories: stories.length,
        familyAccounts: 0, // TODO: Get from family connections
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordForResident = (residentId: string) => {
    router.push(`/record?resident_id=${residentId}`);
  };

  if (loading) {
    return (
      <SidebarLayout role="staff">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-semibold text-muted-foreground">Loading...</div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const filteredResidents =
    filter === 'attention'
      ? residents.filter((r: any) => true) // TODO: Implement filter
      : residents;

  return (
    <SidebarLayout role="staff">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">Manage residents and help them record their stories</p>
          <Button onClick={() => router.push('/staff/residents/new')}>
            + Add New Resident
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{stats.totalResidents}</div>
            <div className="text-xs text-muted-foreground mt-1">Residents</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-amber">{stats.needsAttention}</div>
            <div className="text-xs text-muted-foreground mt-1">Need Attention</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green">{stats.totalStories}</div>
            <div className="text-xs text-muted-foreground mt-1">Stories</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{stats.familyAccounts}</div>
            <div className="text-xs text-muted-foreground mt-1">Family Accounts</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground border border-border hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('attention')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === 'attention'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground border border-border hover:bg-muted'
            }`}
          >
            Needs Attention
          </button>
          <button
            onClick={() => setFilter('no-stories')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === 'no-stories'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground border border-border hover:bg-muted'
            }`}
          >
            No Stories Yet
          </button>
        </div>

        {/* Residents Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left py-2 px-2 text-xs font-semibold">Resident</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold">Last Story</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold">Pending Qs</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold">Stories</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold">Family</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No residents found
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((resident, index) => (
                    <tr
                      key={resident.id}
                      className={`border-b border-border ${
                        index % 2 === 0 ? 'bg-muted/50' : ''
                      }`}
                    >
                      <td className="py-2 px-2">
                        <div className="font-bold text-sm">{resident.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Rm {resident.room_number || 'N/A'} · {resident.care_type}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">-</td>
                      <td className="py-2 px-2">
                        <span className="bg-amber-light text-amber text-xs px-2 py-0.5 rounded-full font-bold">
                          0
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs">0</td>
                      <td className="py-2 px-2 text-xs">0</td>
                      <td className="py-2 px-2">
                        <Button
                          size="sm"
                          onClick={() => handleRecordForResident(resident.id)}
                          className="text-xs px-2 py-1"
                        >
                          Record
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
