
'use client';

import DashboardLayout from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { ContractorTable } from '@/components/contractor/contractor-table';

export default function ContractorPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Contractor Dashboard" subtitle="Monitor all pickup requests across the platform." />
      <div className="mt-8">
        <ContractorTable />
      </div>
    </DashboardLayout>
  );
}
