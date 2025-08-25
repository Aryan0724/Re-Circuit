'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { planRecyclerRoute } from '@/ai/flows/plan-recycler-route';
import { Map, Loader2 } from 'lucide-react';
import type { PickupRequest } from '@/types';

interface RoutePlannerProps {
  acceptedPickups: PickupRequest[];
}

export function RoutePlanner({ acceptedPickups }: RoutePlannerProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [route, setRoute] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePlanRoute = async () => {
    if (acceptedPickups.length === 0) {
      toast({
        variant: 'default',
        title: 'No pickups to plan',
        description: 'Accept some pickup requests first to plan a route.',
      });
      return;
    }
    setIsPlanning(true);
    setRoute(null);

    try {
      const locations = acceptedPickups.map(p => p.location);
      const result = await planRecyclerRoute({ locations });
      setRoute(result.route);
    } catch (error) {
      console.error('Error planning route:', error);
      toast({
        variant: 'destructive',
        title: 'Route Planning Failed',
        description: 'Could not generate an optimized route.',
      });
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={handlePlanRoute} disabled={isPlanning}>
          {isPlanning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Map className="mr-2 h-4 w-4" />
          )}
          Plan Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Optimized Pickup Route</DialogTitle>
          <DialogDescription>
            Here is the most efficient route for your accepted pickups.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {isPlanning && (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
          )}
          {route && (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {route}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
