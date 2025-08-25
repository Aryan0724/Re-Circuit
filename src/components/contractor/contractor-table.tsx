'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PickupRequest, PickupStatus } from '@/types';
import { format } from 'date-fns';

const statusColors: Record<PickupStatus, string> = {
  pending: 'bg-yellow-500',
  accepted: 'bg-blue-500',
  completed: 'bg-green-500',
  rejected: 'bg-red-500',
};


export function ContractorTable() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', category: 'all', location: '' });

  const refreshAllPickups = () => {
    const allPickups: PickupRequest[] = [];
    const pending = JSON.parse(localStorage.getItem('pickups_pending') || '[]');
    allPickups.push(...pending);

    // In a real scenario, you would iterate over all users/recyclers
    // For mock, we'll just check the known ones
    const recyclerIds = ['recycler-001', 'recycler-002'];
    recyclerIds.forEach(id => {
      const accepted = JSON.parse(localStorage.getItem(`pickups_accepted_${id}`) || '[]');
      allPickups.push(...accepted);
    });
    
    // We also need to find completed/rejected ones from citizen records
    const citizenIds = ['citizen-001', 'citizen-002', 'citizen-003', 'citizen-004', 'citizen-005'];
    citizenIds.forEach(id => {
        const citizenPickups: PickupRequest[] = JSON.parse(localStorage.getItem(`pickups_${id}`) || '[]');
        citizenPickups.forEach(p => {
            if (!allPickups.some(ap => ap.id === p.id)) {
                allPickups.push(p);
            }
        });
    });

    setPickups(allPickups);
  }

  useEffect(() => {
    setLoading(true);
    refreshAllPickups();
    setLoading(false);

    window.addEventListener('pickups-updated', refreshAllPickups);
    return () => window.removeEventListener('pickups-updated', refreshAllPickups);
  }, []);

  const filteredPickups = useMemo(() => {
    return pickups.filter(pickup => {
      return (
        (filters.status === 'all' || pickup.status === filters.status) &&
        (filters.category === 'all' || pickup.category === filters.category) &&
        (filters.location === '' || pickup.location.displayAddress.toLowerCase().includes(filters.location.toLowerCase()))
      );
    });
  }, [pickups, filters]);

  const exportToCsv = () => {
    const headers = ['ID', 'Citizen Name', 'Category', 'Status', 'Address', 'Date'];
    const rows = filteredPickups.map(p => [
      p.id,
      p.citizenName,
      p.category,
      p.status,
      `"${p.location.displayAddress.replace(/"/g, '""')}"`,
      p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `re-circuit-pickups-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Pickup Requests</CardTitle>
        <CardDescription>A comprehensive, read-only list of all pickups.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Filter by location (city)..."
            onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
            className="md:max-w-xs"
          />
          <Select onValueChange={(value) => setFilters(f => ({ ...f, category: value }))} defaultValue="all">
            <SelectTrigger className="md:w-[180px]"><SelectValue placeholder="Filter by category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Laptop">Laptop</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              <SelectItem value="Battery">Battery</SelectItem>
              <SelectItem value="Appliance">Appliance</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setFilters(f => ({ ...f, status: value }))} defaultValue="all">
            <SelectTrigger className="md:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCsv} variant="outline" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citizen</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
              ) : filteredPickups.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No results found.</TableCell></TableRow>
              ) : (
                filteredPickups.map(pickup => (
                  <TableRow key={pickup.id}>
                    <TableCell>{pickup.citizenName}</TableCell>
                    <TableCell>{pickup.category}</TableCell>
                    <TableCell><Badge className={`${statusColors[pickup.status]} hover:${statusColors[pickup.status]} text-white capitalize`}>{pickup.status}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate">{pickup.location.displayAddress}</TableCell>
                    <TableCell>{pickup.createdAt ? format(new Date(pickup.createdAt), 'MMM d, yyyy') : 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
