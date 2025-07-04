
"use client";

import Image from 'next/image';
import { MapPin } from "lucide-react";

// This is now a static component that displays a placeholder map image.
// It removes the dependency on Google Maps API.
export default function MapComponent() {
  return (
    <div className="relative w-full h-full">
      <Image
        src="https://placehold.co/800x600.png"
        layout="fill"
        objectFit="cover"
        alt="A placeholder map view of a city with routes."
        data-ai-hint="city map"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <MapPin className="w-10 h-10 text-primary drop-shadow-lg animate-pulse" />
      </div>
    </div>
  );
}
