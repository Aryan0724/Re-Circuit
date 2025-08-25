'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { ContractorTable } from '@/components/contractor/contractor-table';

export default function ContractorDashboardPage() {
    return (
        <DashboardLayout>
            <PageHeader
                title="Contractor Dashboard"
                subtitle="Monitor all pickup requests on the platform."
            />
            <ContractorTable />
        </DashboardLayout>
    );
}
