'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { PickupRequest } from '@/types';
import { Leaf, Recycle, Trash2, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { generateImpactReport } from '@/ai/flows/generate-impact-report';

const IMPACT_VALUES = {
  Laptop: { co2: 22, materials: 1.5, landfill: 2.5 },
  Mobile: { co2: 5, materials: 0.2, landfill: 0.3 },
  Battery: { co2: 1, materials: 0.1, landfill: 0.15 },
  Appliance: { co2: 8, materials: 0.5, landfill: 1 },
  Other: { co2: 8, materials: 0.5, landfill: 1 },
};

interface ImpactMetrics {
  co2: number;
  materials: number;
  landfill: number;
  counts: Record<string, number>;
}

function ImpactCard({ icon, title, value, unit }: { icon: React.ReactNode; title: string; value: string; unit: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </CardContent>
    </Card>
  );
}

export function ImpactDashboard() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile?.uid) return;

    setLoading(true);
    const storedPickups = localStorage.getItem(`pickups_${userProfile.uid}`);
    if (storedPickups) {
      const allPickups: PickupRequest[] = JSON.parse(storedPickups);
      const completedPickups = allPickups.filter(p => p.status === 'completed');
      
      const newMetrics: ImpactMetrics = { co2: 0, materials: 0, landfill: 0, counts: {} };

      completedPickups.forEach(pickup => {
        const category = pickup.category as keyof typeof IMPACT_VALUES;
        if (IMPACT_VALUES[category]) {
          newMetrics.co2 += IMPACT_VALUES[category].co2;
          newMetrics.materials += IMPACT_VALUES[category].materials;
          newMetrics.landfill += IMPACT_VALUES[category].landfill;
          newMetrics.counts[category] = (newMetrics.counts[category] || 0) + 1;
        }
      });
      setMetrics(newMetrics);
    } else {
      setMetrics({ co2: 0, materials: 0, landfill: 0, counts: {} });
    }
    setLoading(false);
  }, [userProfile?.uid]);

  const handleGenerateReport = async () => {
    if (!metrics) return;
    
    setIsGenerating(true);
    setReport(null);

    try {
        const contributionSummary = Object.entries(metrics.counts)
            .map(([category, count]) => `${count} ${category}(s)`)
            .join(', ');
        
        if (!contributionSummary) {
            toast({ description: "You need completed pickups to generate a report." });
            setIsGenerating(false);
            return;
        }

        const result = await generateImpactReport({ contributionSummary: `User has contributed: ${contributionSummary}.` });
        setReport(result.report);
    } catch (error) {
        console.error("Error generating report:", error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate your impact report.' });
    } finally {
        setIsGenerating(false);
    }
  }


  if (loading) {
    return <p>Loading impact data...</p>;
  }

  if (!metrics) {
    return <p>No impact data available.</p>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Environmental Impact</CardTitle>
          <CardDescription>Metrics based on your completed e-waste pickups.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <ImpactCard icon={<Leaf className="h-4 w-4 text-green-500" />} title="CO₂ Reduced" value={`${metrics.co2.toFixed(1)} kg`} unit="Carbon dioxide equivalent" />
          <ImpactCard icon={<Recycle className="h-4 w-4 text-blue-500" />} title="Materials Recovered" value={`${metrics.materials.toFixed(1)} kg`} unit="Metals, plastics, and more" />
          <ImpactCard icon={<Trash2 className="h-4 w-4 text-gray-500" />} title="Waste Diverted" value={`${metrics.landfill.toFixed(1)} kg`} unit="Total weight from landfills" />
        </CardContent>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Contribution Breakdown</CardTitle>
                <CardDescription>How your items add up.</CardDescription>
            </CardHeader>
            <CardContent>
                {Object.keys(metrics.counts).length > 0 ? (
                    <ul className="space-y-2">
                        {Object.entries(metrics.counts).map(([category, count]) => (
                            <li key={category} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                                <span className="font-medium">{category}</span>
                                <span className="text-muted-foreground">{count} item(s)</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No completed pickups yet.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Personalized Impact Report
                </CardTitle>
                <CardDescription>Let our AI summarize your amazing contribution!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-full min-h-[150px]">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Generating your report...</p>
                    </div>
                ) : report ? (
                    <div className="text-center space-y-4">
                        <p className="italic text-foreground/80">"{report}"</p>
                         <Button onClick={handleGenerateReport} variant="outline" size="sm">Regenerate</Button>
                    </div>
                ) : (
                    <Button onClick={handleGenerateReport}>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Generate My Impact Report
                    </Button>
                )}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
