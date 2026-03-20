'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StaffResidentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'attention' | 'no-stories'>('all');

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      const residentsRes = await api.get('/residents');
      setResidents(residentsRes.data.data.residents || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents =
    filter === 'attention'
      ? residents.filter((r: any) => true) // TODO: Implement attention logic
      : filter === 'no-stories'
        ? residents.filter((r: any) => true) // TODO: Implement no-stories logic
        : residents;

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

  return (
    <SidebarLayout role="staff">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Residents</h1>
            <p className="text-muted-foreground text-lg">Manage residents and help them record their stories</p>
          </div>
          <Button onClick={() => router.push('/staff/residents/new')}>+ Add New Resident</Button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground border border-border hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('attention')}
            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === 'attention'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground border border-border hover:bg-muted'
            }`}
          >
            Needs Attention
          </button>
          <button
            onClick={() => setFilter('no-stories')}
            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === 'no-stories'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground border border-border hover:bg-muted'
            }`}
          >
            No Stories Yet
          </button>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left py-2 px-2 text-sm font-semibold">Resident</th>
                  <th className="text-left py-2 px-2 text-sm font-semibold">Last Story</th>
                  <th className="text-left py-2 px-2 text-sm font-semibold">Pending Qs</th>
                  <th className="text-left py-2 px-2 text-sm font-semibold">Stories</th>
                  <th className="text-left py-2 px-2 text-sm font-semibold">Family</th>
                  <th className="text-left py-2 px-2 text-sm font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No residents found
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((resident, index) => (
                    <tr
                      key={resident.id}
                      className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/50' : ''}`}
                    >
                      <td className="py-2 px-2">
                        <div className="font-bold text-sm">{resident.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Rm {resident.room_number || 'N/A'} · {resident.care_type}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-sm text-muted-foreground">-</td>
                      <td className="py-2 px-2">
                        <span className="bg-amber-light text-amber text-sm px-2 py-0.5 rounded-full font-bold">
                          0
                        </span>
                      </td>
                      <td className="py-2 px-2 text-sm">0</td>
                      <td className="py-2 px-2 text-sm">0</td>
                      <td className="py-2 px-2">
                        <Button
                          size="sm"
                          onClick={() => handleRecordForResident(resident.id)}
                          className="text-sm px-2 py-1"
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

