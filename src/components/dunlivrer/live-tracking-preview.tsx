
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import MapComponent from "./map-component";

type LiveTrackingPreviewProps = {
  pickupAddress: string | null;
  destinationAddresses: string[];
};

export default function LiveTrackingPreview({ pickupAddress, destinationAddresses }: LiveTrackingPreviewProps) {
  const hasAddresses = pickupAddress && destinationAddresses.length > 0 && destinationAddresses.some(d => d);
  
  const pickupName = pickupAddress;

  return (
    <Card className="w-full h-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2"><MapPin className="w-7 h-7" /> Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mt-4 aspect-[16/10] bg-muted/50 rounded-lg overflow-hidden border border-white/10">
          <MapComponent 
            pickupAddress={pickupAddress}
            destinationAddresses={destinationAddresses}
          />
          {hasAddresses && (
              <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm border border-white/10 pointer-events-none">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium truncate">{pickupName}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 shrink-0" />
                    <div className="flex flex-col items-end gap-1 truncate text-right">
                        {destinationAddresses.filter(d => d).map((dest, i) => {
                            const destName = dest;
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="font-medium truncate">{destName}</span>
                                    <MapPin className="w-4 h-4 text-accent shrink-0" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
