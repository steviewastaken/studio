
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DeliveryDetails } from "./types";
import { MapPin, Package, Clock, CheckCircle2, Truck, Home, UserRoundCheck, ArrowRight, RefreshCw } from "lucide-react";
import MapComponent from "./map-component";
import type { FindDriverOutput } from "@/ai/flows/find-driver";
import type { DeliveryStatus } from "@/app/tracking/page";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useLanguage } from "@/context/language-context";

type TrackingMapProps = {
  deliveryDetails: DeliveryDetails | null;
  driverDetails: FindDriverOutput | null;
  deliveryStatus: DeliveryStatus;
  onRerouteRequest: () => void;
};

function StatusStep({ icon, label, isCompleted, isCurrent }: { icon: React.ReactNode, label: string, isCompleted: boolean, isCurrent: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 z-10">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4",
        isCompleted ? 'bg-primary border-primary/50 text-primary-foreground' :
        isCurrent ? 'bg-primary border-primary/50 text-primary-foreground scale-110 shadow-lg shadow-primary/40' :
        'bg-muted border-transparent text-muted-foreground'
      )}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : icon}
      </div>
      <p className={cn(
        "text-xs md:text-sm font-medium transition-colors text-center",
        isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
      )}>{label}</p>
    </div>
  );
}



const statusMap: { [key in DeliveryStatus]: number } = {
    IDLE: -1,
    SEARCHING: 0,
    FOUND: 1,
    IN_TRANSIT: 2,
    DELIVERED: 3
};

export default function TrackingMap({ deliveryDetails, driverDetails, deliveryStatus, onRerouteRequest }: TrackingMapProps) {
  const { content } = useLanguage();

  const steps = [
    { id: 'SCHEDULED', label: "Package Registered", icon: <Package className="w-6 h-6" /> },
    { id: 'FOUND', label: "Driver Assigned", icon: <UserRoundCheck className="w-6 h-6" /> },
    { id: 'IN_TRANSIT', label: "Package Picked Up", icon: <Truck className="w-6 h-6" /> },
    { id: 'DELIVERED', label: "Delivered", icon: <Home className="w-6 h-6" /> }
  ];
  
  const currentStepIndex = statusMap[deliveryStatus];
  const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;
  
  const origin = deliveryDetails?.pickupAddress || null;
  const destination = deliveryDetails?.destinationAddresses[0] || null;

  return (
    <Card className="w-full h-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-3"><MapPin className="text-primary"/> {content.tracking_live_title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-[16/10] bg-muted/50 rounded-lg overflow-hidden border border-white/10">
          <MapComponent 
              origin={origin}
              destination={destination}
              animateDriverPath={deliveryStatus === 'IN_TRANSIT'}
          />
          {deliveryDetails ? (
             <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm border border-white/10 pointer-events-none">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium truncate">{deliveryDetails.pickupAddress}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 shrink-0" />
                    <div className="flex flex-col items-end gap-1 truncate text-right">
                        {deliveryDetails.destinationAddresses.map((dest, i) => (
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
                    <p className="font-semibold mt-4 text-lg">{content.tracking_map_no_delivery}</p>
                    <p className="text-sm text-muted-foreground">{content.tracking_map_no_delivery_desc}</p>
                </div>
            </div>
          )}
        </div>
        
        {deliveryDetails && (
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-0">
              <div className="flex items-center justify-between relative px-2 md:px-4">
                <div className="absolute top-6 left-0 w-full h-1 bg-muted-foreground/20">
                    <div className="h-1 bg-primary transition-all duration-1000 ease-in-out" style={{width: `${progressPercentage}%`}}></div>
                </div>
                {steps.map((step, index) => (
                  <StatusStep
                    key={step.id}
                    icon={step.icon}
                    label={step.label}
                    isCompleted={index < currentStepIndex}
                    isCurrent={index === currentStepIndex}
                  />
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex flex-col md:flex-row justify-between items-center text-foreground gap-4">
                  <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{deliveryStatus === 'DELIVERED' ? `${content.tracking_status_label}:` : content.tracking_eta_label}</span>
                       <span className="font-bold text-lg text-primary">
                        {deliveryStatus === 'DELIVERED'
                            ? content.tracking_status_delivered_text
                            : driverDetails
                            ? driverDetails.driverEta
                            : content.tracking_eta_calculating
                        }
                      </span>
                  </div>
                  {deliveryStatus === 'IN_TRANSIT' && (
                    <Button onClick={onRerouteRequest} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4"/>
                        {content.tracking_reroute_button}
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
