"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Map, Video, MapPin, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LiveTrackingPreviewProps = {
  pickupAddress: string | null;
  destinationAddresses: string[];
};

export default function LiveTrackingPreview({ pickupAddress, destinationAddresses }: LiveTrackingPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to simulate live video.',
          });
        }
      } else {
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();
  }, [toast]);

  const hasAddresses = pickupAddress && destinationAddresses.length > 0 && destinationAddresses.some(d => d);

  return (
    <Card className="w-full h-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map"><Map className="mr-2" /> Map View</TabsTrigger>
            <TabsTrigger value="video"><Video className="mr-2" /> Live Video</TabsTrigger>
          </TabsList>
          <TabsContent value="map">
            <div className="relative mt-4 aspect-[16/10] bg-muted/50 rounded-lg overflow-hidden border border-white/10">
              <Image src="https://placehold.co/800x500.png" alt="Map of delivery route" fill data-ai-hint="dark city map" className="object-cover opacity-50 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              {hasAddresses ? (
                 <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm border border-white/10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="font-medium truncate">{pickupAddress}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 shrink-0" />
                        <div className="flex flex-col items-end gap-1 truncate text-right">
                            {destinationAddresses.map((dest, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="font-medium truncate">{dest}</span>
                                    <MapPin className="w-4 h-4 text-accent shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-lg">
                        <MapPin className="mx-auto w-12 h-12 text-primary/50" />
                        <p className="font-semibold mt-4 text-lg">Route Preview</p>
                        <p className="text-sm text-muted-foreground">Select pickup & destination to see the route.</p>
                    </div>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="video">
            <div className="relative mt-4 aspect-video bg-muted/50 rounded-lg overflow-hidden border border-white/10 flex flex-col justify-center items-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center">
                        <Alert variant="destructive">
                          <Video className="h-4 w-4" />
                          <AlertTitle>Camera Access Required</AlertTitle>
                          <AlertDescription>
                            Please allow camera access in your browser to use the live video feature. This is a simulation of the courier's feed.
                          </AlertDescription>
                        </Alert>
                    </div>
                )}
                 {hasCameraPermission === null && (
                    <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center">
                         <p>Requesting camera access...</p>
                    </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
