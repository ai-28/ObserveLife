'use client';

import SidebarLayout from '@/components/layout/SidebarLayout';
import AddResidentWizard from '@/components/features/AddResidentWizard';

export default function AddResidentPage() {
  return (
    <SidebarLayout role="staff">
      <AddResidentWizard role="staff" />
    </SidebarLayout>
  );
}
