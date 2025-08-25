'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { PickupRequest } from '@/types';
import { Leaf, Recycle, Trash2, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { generateImpactReport } from '@/ai/flows/generate-impact-report';
import { Share } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Badges } from './impact-badges';

// Define impact values per item category
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

interface CommunityMetrics {
  totalCo2Reduced: number;
  totalMaterialsRecovered: number;
  totalWasteDiverted: number;
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
  const [communityMetrics, setCommunityMetrics] = useState<CommunityMetrics | null>(null);

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

    const fetchCommunityImpact = async () => {
      // In a real app, this would come from a real-time backend. For demo, we use mock data.
      setCommunityMetrics({ totalCo2Reduced: 1582, totalMaterialsRecovered: 850, totalWasteDiverted: 1245 });
    };

    fetchCommunityImpact();

    setLoading(false);
  }, [userProfile?.uid]);

  const handleGenerateReport = async () => {
    if (!metrics || !userProfile) return;
    
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

        const latestBadge = userProfile.badges && userProfile.badges.length > 0
            ? userProfile.badges[userProfile.badges.length - 1]
            : 'Eco-Explorer';
        
        const communityCo2 = communityMetrics?.totalCo2Reduced || 0;

        const result = await generateImpactReport({ 
            contributionSummary: `User has contributed: ${contributionSummary}.`,
            latestBadgeName: latestBadge, 
            communityCo2Total: communityCo2 
        });
        setReport(result.report);
    } catch (error) {
        console.error("Error generating report:", error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate your impact report.' });
    } finally {
        setIsGenerating(false);
    }
  }

  const handleShareImpact = async () => {
    const cardElement = document.getElementById('impact-share-card');
    if (!cardElement) {
        toast({ variant: 'destructive', description: "Could not find the share card element." });
        return;
    }

    try {
        // Temporarily make the hidden card visible for the screenshot
        cardElement.classList.remove('hidden');
        const dataUrl = await toPng(cardElement, { quality: 0.95 });
        cardElement.classList.add('hidden'); // Hide it again
        
        if (navigator.share) {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'my-recircuit-impact.png', { type: 'image/png' });
             await navigator.share({
                files: [file],
                title: 'My Re-Circuit Impact!',
                text: 'Check out my environmental impact with Re-Circuit!',
            });
        } else {
             const link = document.createElement('a');
            link.download = 'my-recircuit-impact.png';
            link.href = dataUrl;
            link.click();
        }

    } catch (error) {
        console.error('Error generating or sharing image:', error);
        toast({ variant: 'destructive', description: "Failed to generate shareable image." });
    }
  };

  if (loading) {
    return <p>Loading impact data...</p>;
  }

  if (!metrics) {
    return <p>No impact data available.</p>;
  }
  
  const latestBadgeName = userProfile?.badges && userProfile.badges.length > 0 ? userProfile.badges[userProfile.badges.length - 1] : "Eco-Explorer";

  return (
    <div className="space-y-8">
       {/* Shareable Card - rendered but hidden */}
        <div id="impact-share-card" className="p-8 bg-gradient-to-br from-green-100 via-blue-100 to-primary/20 rounded-lg shadow-lg text-center space-y-4 fixed -left-[9999px] top-0 w-[400px]">
            <h3 className="text-2xl font-bold text-primary">{userProfile?.name || 'Re-Circuit User'}</h3>
            <p className="text-lg text-foreground/80">My Impact Highlights:</p>
            <div className="flex justify-around text-base font-semibold text-foreground/90">
                <span>🍃 {metrics.co2.toFixed(1)} kg CO₂</span>
                <span>♻️ {metrics.materials.toFixed(1)} kg Materials</span>
                <span>🗑️ {metrics.landfill.toFixed(1)} kg Diverted</span>
            </div>
            <p className="text-base text-accent-foreground font-semibold pt-2">Just earned the '{latestBadgeName}' badge!</p>
            <p className="text-sm font-bold text-primary pt-4">Re-Circuit</p>
        </div>


      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Your Environmental Impact</CardTitle>
                <CardDescription>Metrics from your completed pickups.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <ImpactCard icon={<Leaf className="h-4 w-4 text-green-500" />} title="CO₂ Reduced" value={`${metrics.co2.toFixed(1)} kg`} unit="Carbon dioxide equivalent" />
              <ImpactCard icon={<Recycle className="h-4 w-4 text-blue-500" />} title="Materials Recovered" value={`${metrics.materials.toFixed(1)} kg`} unit="Valuable materials" />
              <ImpactCard icon={<Trash2 className="h-4 w-4 text-gray-500" />} title="Waste Diverted" value={`${metrics.landfill.toFixed(1)} kg`} unit="From landfills" />
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Personalized Impact Report
                </CardTitle>
                <CardDescription>Let our AI summarize your contribution!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-full min-h-[150px]">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Generating your report...</p>
                    </div>
                ) : report ? (
                     <div className="text-center space-y-4">
                        <p className="italic text-foreground/80 text-center">"{report}"</p>
                        <div className="flex gap-2 justify-center">
                            <Button onClick={handleShareImpact}><Share className="mr-2 h-4 w-4"/>Share</Button>
                            <Button onClick={handleGenerateReport} variant="outline" size="sm">Regenerate</Button>
                        </div>
                    </div>
                ) : (
                    <Button onClick={handleGenerateReport} disabled={metrics.co2 === 0}>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Generate My Impact Report
                    </Button>
                )}
            </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-8 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Contribution Breakdown</CardTitle>
                <CardDescription>How your recycled items add up.</CardDescription>
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
         {communityMetrics && (
             <Card>
                <CardHeader>
                    <CardTitle>Our Community's Impact</CardTitle>
                    <CardDescription>The combined effort of all Re-Circuit users.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <ImpactCard icon={<Leaf className="h-4 w-4 text-green-500" />} title="Total CO₂" value={`${communityMetrics.totalCo2Reduced.toFixed(0)} kg`} unit="Community total" />
                    <ImpactCard icon={<Recycle className="h-4 w-4 text-blue-500" />} title="Total Materials" value={`${communityMetrics.totalMaterialsRecovered.toFixed(0)} kg`} unit="Community total" />
                    <ImpactCard icon={<Trash2 className="h-4 w-4 text-gray-500" />} title="Total Waste" value={`${communityMetrics.totalWasteDiverted.toFixed(0)} kg`} unit="Community total" />
                </CardContent>
            </Card>
        )}
       </div>


      <Badges earnedBadges={userProfile?.badges || []} />

    </div>
  );
}
