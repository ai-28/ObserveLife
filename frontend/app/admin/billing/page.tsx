'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import SidebarLayout from '@/components/layout/SidebarLayout';

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [stats, setStats] = useState({
    residents: 0,
    stories: 0,
    familyAccounts: 0,
    questionsAnswered: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      const user = userRes.data.data.user;

      if (user.role !== 'facility_admin') {
        router.push('/login');
        return;
      }

      if (user.organization_id) {
        const orgRes = await api.get(`/organizations/${user.organization_id}`);
        setOrganization(orgRes.data.data.organization);
      }

      const residentsRes = await api.get('/residents');
      const residents = residentsRes.data.data.residents || [];
      setStats((prev) => ({ ...prev, residents: residents.length }));

      const storiesRes = await api.get('/stories');
      const stories = storiesRes.data.data.stories || [];
      setStats((prev) => ({ ...prev, stories: stories.length }));

      const questionsRes = await api.get('/questions');
      const questions = questionsRes.data.data.questions || [];
      const answered = questions.filter((q: any) => q.status === 'ANSWERED');
      setStats((prev) => ({ ...prev, questionsAnswered: answered.length }));
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentBill = Math.max(500, stats.residents * 10);
  const therapyPotential = 11280;
  const netROI = therapyPotential - currentBill;

  if (loading) {
    return (
      <SidebarLayout role="facility_admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-semibold text-muted-foreground">Loading...</div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const formattedNextBilling = nextBillingDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SidebarLayout role="facility_admin">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-0 border border-[#D0D0D0] rounded-lg overflow-hidden bg-card">
          {/* Left Column */}
          <div className="flex-1 p-4 border-r border-[#D0D0D0]">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              Current Plan
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Type</span>
                <span className="text-xs font-bold text-[#1a2e2e]">SNF / Skilled Nursing</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Rate</span>
                <span className="text-xs font-bold text-primary">$10 per resident/mo</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Active residents</span>
                <span className="text-xs font-bold text-[#1a2e2e]">{stats.residents}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Current bill</span>
                <span className="text-base font-bold text-[#1a2e2e]">${currentBill.toFixed(2)}/mo</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Next billing</span>
                <span className="text-xs font-bold text-[#1a2e2e]">{formattedNextBilling}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full">
                Update Resident Count
              </Button>
              <Button variant="secondary" size="sm" className="w-full">
                Manage Payment Method
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 p-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              Therapy Billing ROI
            </h2>
            <div className="bg-teal-light border border-[#2A7F7F] rounded p-3 mb-4">
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">You pay Observe Life</span>
                  <span className="font-bold text-[#1a2e2e]">${currentBill.toFixed(0)}/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Therapy billing potential</span>
                  <span className="font-bold text-green">${therapyPotential.toLocaleString()}/mo</span>
                </div>
              </div>
              <div className="border-t border-[#2A7F7F] pt-2 mt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-[#1a2e2e]">Net ROI</span>
                <span className="text-base font-bold text-green">
                  +${netROI.toLocaleString()}/mo
                </span>
              </div>
            </div>

            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              Usage This Month
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Stories recorded</span>
                <span className="text-xs font-bold text-[#1a2e2e]">{stats.stories}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Family accounts</span>
                <span className="text-xs font-bold text-[#1a2e2e]">{stats.familyAccounts}</span>
              </div>
                <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Questions answered</span>
                <span className="text-xs font-bold text-[#1a2e2e]">{stats.questionsAnswered}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
