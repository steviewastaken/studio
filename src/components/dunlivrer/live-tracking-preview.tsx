
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import MapComponent from "./map-component";

type LiveTrackingPreviewProps = {
  pickupAddress: string | null;
  destinationAddresses: string[];
};

export default function LiveTrackingPreview({ pickupAddress, destinationAddresses }: LiveTrackingPreviewProps) {
  const hasAddresses = pickupAddress && destinationAddresses.length > 0 && destinationAddresses.some(d => d && d.trim() !== '');

  const waypoints = hasAddresses ? destinationAddresses.slice(0, -1) : [];
  const destination = hasAddresses ? destinationAddresses[destinationAddresses.length - 1] : null;

  return (
    <Card className="w-full h-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2"><MapPin className="w-7 h-7" /> Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mt-4 aspect-[16/10] bg-muted/50 rounded-lg overflow-hidden border border-white/10">
          <MapComponent 
            origin={pickupAddress} 
            destination={destination}
            waypoints={waypoints}
          />
          {!hasAddresses && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm pointer-events-none">
                <div className="text-center p-8">
                    <MapPin className="mx-auto w-12 h-12 text-primary/50" />
                    <p className="font-semibold mt-4 text-lg">Enter Addresses</p>
                    <p className="text-sm text-muted-foreground">Select pickup & destination to see the route.</p>
                </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
