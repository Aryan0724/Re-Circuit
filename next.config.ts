import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      '*.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev',
    ],
  },
  allowedDevOrigins: [
    '*.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev',
  ],
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyAcoz3FPtzMlqmVlhSKhKIIsR9dcv4ESYU",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "re-circuit.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "re-circuit",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "re-circuit.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "220008974760",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:220008974760:web:5fa2f57cf573fca058759d",
  },
};

export default nextConfig;
