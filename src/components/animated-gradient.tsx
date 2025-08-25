'use client';

export const AnimatedGradient = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:14px_24px]"
    >
        <div className="pointer-events-none absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(circle_farthest-side_at_0_100%,hsl(var(--background)),transparent),radial-gradient(circle_farthest-side_at_100%_0,hsl(var(--primary)/0.5),transparent),radial-gradient(circle_farthest-side_at_100%_100%,hsl(var(--accent)/0.5),transparent),radial-gradient(circle_farthest-side_at_0_0,hsl(var(--primary)/0.7),hsl(var(--accent)/0.7))] bg-background [background-size:200%_200%] animate-[gradient_15s_ease_infinite]"></div>
    </div>
  );
};
