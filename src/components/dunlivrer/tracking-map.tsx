
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DeliveryDetails } from "./types";
import type { EtaResult } from "@/app/page";
import Image from "next/image";
import { MapPin, Package, Clock, CheckCircle2, ArrowRight, Truck } from "lucide-react";

type TrackingMapProps = {
  deliveryDetails: DeliveryDetails | null;
  etaResult: EtaResult;
};

function StatusStep({ icon, label, isCompleted, isCurrent }: { icon: React.ReactNode, label: string, isCompleted: boolean, isCurrent: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 z-10">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isCompleted || isCurrent ? 'bg-primary border-primary/50 text-primary-foreground' : 'bg-muted border-transparent text-muted-foreground'}`}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : icon}
      </div>
      <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
    </div>
  );
}

export default function TrackingMap({ deliveryDetails, etaResult }: TrackingMapProps) {
  return (
    <Card className="w-full h-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-3"><MapPin className="text-primary"/> Live Tracking</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-[16/10] bg-muted/50 rounded-lg overflow-hidden border border-white/10">
          <Image src="https://placehold.co/800x500.png" alt="Map of delivery route" fill data-ai-hint="dark city map" className="object-cover opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {deliveryDetails ? (
             <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-medium truncate">{deliveryDetails.pickupAddress}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 shrink-0" />
                    <div className="flex items-center gap-2 truncate text-right">
                        <MapPin className="w-4 h-4 text-accent shrink-0" />
                        <span className="font-medium truncate">{deliveryDetails.destinationAddress}</span>
                    </div>
                </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-lg">
                    <MapPin className="mx-auto w-12 h-12 text-primary/50" />
                    <p className="font-semibold mt-4 text-lg">No Active Delivery</p>
                    <p className="text-sm text-muted-foreground">Schedule a new delivery to see it here.</p>
                </div>
            </div>
          )}
        </div>
        
        {deliveryDetails && (
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-0">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-6 left-0 w-full h-0.5 bg-muted-foreground/20">
                    <div className="h-0.5 bg-primary transition-all duration-1000" style={{width: '25%'}}></div>
                </div>
                <StatusStep icon={<Package className="w-6 h-6" />} label="Scheduled" isCompleted={true} isCurrent={false} />
                <StatusStep icon={<Truck className="w-6 h-6" />} label="In Transit" isCompleted={false} isCurrent={true} />
                <StatusStep icon={<HomeIcon className="w-6 h-6" />} label="Delivered" isCompleted={false} isCurrent={false} />
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between items-center text-foreground">
                  <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Estimated Arrival:</span>
                  </div>
                  <span className="font-bold text-xl text-primary">
                    {etaResult ? `${etaResult.estimatedTime} min` : 'Calculating...'}
                  </span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}


function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}
