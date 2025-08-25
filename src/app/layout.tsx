
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AnimatedGradient } from '@/components/animated-gradient';

export const metadata: Metadata = {
  title: 'Re-Circuit',
  description: 'An e-waste management platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full">
            <div className="main-background">
                <AnimatedGradient />
            </div>
            {children}
            <Toaster />
      </body>
    </html>
  );
}
