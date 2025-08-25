# **App Name**: Re-Circuit

## Core Features:

- Role-Based Authentication: User authentication via Google Sign-In with role selection (Citizen, Recycler, Admin, Contractor).
- Citizen Dashboard: Dashboard for citizens to create new pickup requests with image upload.
- AI-Powered Description Generation: AI tool to automatically generate the 'Description' of the item based on uploaded image using Gemini API.
- Recycler Dashboard: Dashboard for recyclers to view pending pickup requests and manage their status.
- AI Route Optimization: AI tool to plan optimal travel route using the Gemini API based on accepted pickup locations.
- Admin Dashboard: Admin dashboard for managing users and approving recyclers.
- Contractor Monitoring Dashboard: Contractor dashboard for read-only monitoring of all pickup requests with filtering and CSV export.

## Style Guidelines:

- Primary color: Saturated blue (#29ABE2) to convey trust and environmental awareness.
- Background color: Light blue (#E5F5FB), a desaturated tint of the primary, for a clean and airy feel.
- Accent color: Green (#90EE90) for calls to action, inspired by environmental themes and analogous to blue on the color wheel.
- Body and headline font: 'Inter' sans-serif for a modern and neutral feel.
- lucide-react icons will be used
- framer-motion library will be used to subtly animate visual elements on dashboards
- The UI should be modern, responsive, and visually appealing, incorporating an animated gradient background. Tailwind CSS will handle responsive styling