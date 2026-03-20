'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AddStaffMemberDialog from '@/components/features/AddStaffMemberDialog';

export default function FacilityAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [stats, setStats] = useState({
    residents: 0,
    stories: 0,
    familyAccounts: 0,
    questionsAnswered: 0,
  });
  const [staff, setStaff] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadStaff = async () => {
    try {
      const staffRes = await api.get('/staff');
      const staffList = staffRes.data.data.staff || [];
      // Format staff data for display
      setStaff(staffList.map((member: any) => {
        let roleDisplay = '';
        if (member.role === 'staff') {
          // Show staff_type for staff members
          roleDisplay = member.staff_type === 'facilitator' ? 'Facilitator' : 
                       member.staff_type === 'therapist' ? 'Therapist' : 
                       'Staff';
        } else if (member.role === 'facility_admin') {
          roleDisplay = 'Facility Admin';
        } else {
          roleDisplay = member.role;
        }
        
        return {
          id: member.id,
          name: member.name,
          role: roleDisplay,
          last_login: null, // TODO: Add last_login tracking
        };
      }));
    } catch (staffError: any) {
      console.error('Error loading staff:', staffError);
      setStaff([]);
    }
  };

  const loadData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      const user = userRes.data.data.user;

      if (user.role !== 'facility_admin') {
        router.push('/login');
        return;
      }

      // Get organization
      if (user.organization_id) {
        const orgRes = await api.get(`/organizations/${user.organization_id}`);
        setOrganization(orgRes.data.data.organization);
      }

      // Get residents
      const residentsRes = await api.get('/residents');
      const residents = residentsRes.data.data.residents || [];
      setStats((prev) => ({ ...prev, residents: residents.length }));

      // Get stories
      const storiesRes = await api.get('/stories');
      const stories = storiesRes.data.data.stories || [];
      setStats((prev) => ({ ...prev, stories: stories.length }));

      // Get questions
      const questionsRes = await api.get('/questions');
      const questions = questionsRes.data.data.questions || [];
      const answered = questions.filter((q: any) => q.status === 'ANSWERED');
      setStats((prev) => ({ ...prev, questionsAnswered: answered.length }));

      // TODO: Get family accounts count
      setStats((prev) => ({ ...prev, familyAccounts: 0 }));

      // Get staff list
      await loadStaff();
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
      <SidebarLayout role="facility_admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-semibold text-muted-foreground">Loading...</div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const currentBill = Math.max(500, stats.residents * 10);
  const therapyPotential = 11280;
  const netROI = therapyPotential - currentBill;

  return (
    <SidebarLayout role="facility_admin">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-0 border border-[#D0D0D0] rounded-lg overflow-hidden bg-card">
          {/* Left Column */}
          <div className="flex-1 p-4 border-r border-[#D0D0D0]">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              Usage This Month
            </h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.residents}</div>
                <div className="text-xs text-[#666] mt-1">Residents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green">{stats.stories}</div>
                <div className="text-xs text-[#666] mt-1">Stories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.familyAccounts}</div>
                <div className="text-xs text-[#666] mt-1">Family Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.questionsAnswered}</div>
                <div className="text-xs text-[#666] mt-1">Qs Answered</div>
              </div>
            </div>

            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Staff</h2>
            <div className="overflow-x-auto mb-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-[#1a2e2e]">
                    <th className="text-left py-2 px-2 font-semibold text-white">Name</th>
                    <th className="text-left py-2 px-2 font-semibold text-white">Role</th>
                    <th className="text-left py-2 px-2 font-semibold text-white">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-muted-foreground text-xs">
                        No staff members yet
                      </td>
                    </tr>
                  ) : (
                    staff.map((member) => (
                      <tr key={member.id} className="border-b border-[#D0D0D0]">
                        <td className="py-2 text-[#1a2e2e]">{member.name}</td>
                        <td className="py-2 text-[#1a2e2e]">{member.role}</td>
                        <td className="py-2 text-[#1a2e2e]">{member.last_login || 'Never'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => setDialogOpen(true)}
            >
              + Add Staff Member
            </Button>
          </div>

          {/* Right Column - Billing */}
          <div className="flex-1 p-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Billing</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Plan</span>
                <span className="text-xs font-bold text-[#1a2e2e]">SNF · $10/resident/mo</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                <span className="text-xs text-[#666]">Residents</span>
                <span className="text-xs font-bold text-primary">{stats.residents}</span>
              </div>
                <div className="flex justify-between items-center py-1 border-b border-[#D0D0D0]">
                    <span className="text-xs text-[#666]">Current Bill</span>
                <span className="text-sm font-bold text-primary">${currentBill.toFixed(2)}/mo</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Button variant="secondary" size="sm" className="w-full" onClick={() => router.push('/admin/billing')}>
                Update Resident Count
              </Button>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => router.push('/admin/billing')}>
                Manage Payment
              </Button>
            </div>

            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              Therapy ROI
            </h2>
            <div className="bg-teal-light border border-[#2A7F7F] rounded p-3">
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">You pay</span>
                  <span className="font-bold text-[#1a2e2e]">${currentBill.toFixed(0)}/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Therapy billing potential</span>
                  <span className="font-bold text-green">${therapyPotential.toLocaleString()}/mo</span>
                </div>
              </div>
              <div className="border-t border-teal pt-2 mt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-[#1a2e2e]">Net ROI</span>
                <span className="text-lg font-bold text-green">
                  +${netROI.toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Member Dialog */}
      <AddStaffMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={async () => {
          // Reload staff list after successful addition
          await loadStaff();
        }}
      />
    </SidebarLayout>
  );
}
