'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Laptop, Smartphone, Medal, Shield, HandHeart, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const ALL_BADGES: Badge[] = [
  { id: 'first-contribution', name: 'First Contribution', description: 'Complete your first pickup.', icon: HandHeart },
 { id: 'laptop-recycler', name: 'Laptop Recycler', description: 'Recycle your first laptop.', icon: Laptop },
  { id: 'mobile-master', name: 'Mobile Master', description: 'Recycle 5 mobile phones.', icon: Smartphone },
  { id: 'landfill-hero-10kg', name: 'Landfill Hero (10kg)', description: 'Divert over 10kg of waste.', icon: Flame },
  { id: 'eco-veteran', name: 'Eco-Veteran', description: 'Complete 10 pickups.', icon: Shield },
  { id: 'top-contributor', name: 'Top Contributor', description: 'Reach 500 credits.', icon: Medal },
];

interface BadgesProps {
  earnedBadges: string[];
}

export function Badges({ earnedBadges }: BadgesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Badge Collection</CardTitle>
        <CardDescription>Celebrate your achievements and unlock new badges!</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 text-center">
            {ALL_BADGES.map((badge) => {
              const isEarned = earnedBadges.includes(badge.id);
              const BadgeIcon = badge.icon;
              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300',
                        isEarned ? 'border-primary/50 bg-primary/10' : 'border-dashed border-muted-foreground/30 bg-muted/30 opacity-60'
                      )}
                    >
                      <BadgeIcon
                        className={cn(
                          'h-12 w-12',
                          isEarned ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span
                        className={cn(
                          'font-semibold text-xs',
                          isEarned ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {badge.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{badge.name}</p>
                    <p>{badge.description}</p>
                    {!isEarned && <p className="text-xs text-muted-foreground italic mt-1">Not yet earned</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
