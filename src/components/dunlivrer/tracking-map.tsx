import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DeliveryDetails } from "./types";
import type { EtaResult } from "@/app/page";
import Image from "next/image";
import { MapPin, Package, Clock, CheckCircle2, ArrowRight } from "lucide-react";

type TrackingMapProps = {
  deliveryDetails: DeliveryDetails | null;
  etaResult: EtaResult;
};

function StatusStep({ icon, label, isCompleted, isCurrent }: { icon: React.ReactNode, label: string, isCompleted: boolean, isCurrent: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted || isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : icon}
      </div>
      <p className={`text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
    </div>
  );
}

export default function TrackingMap({ deliveryDetails, etaResult }: TrackingMapProps) {
  return (
    <Card className="w-full h-full shadow-lg rounded-xl flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Live Tracking</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-[16/10] bg-muted rounded-lg overflow-hidden border">
          <Image src="https://placehold.co/800x500.png" alt="Map of delivery route" layout="fill" objectFit="cover" data-ai-hint="city map" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          {deliveryDetails ? (
             <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm">
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
                <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg">
                    <p className="font-semibold">No active delivery.</p>
                    <p className="text-sm text-muted-foreground">Schedule a new delivery to start tracking.</p>
                </div>
            </div>
          )}
        </div>
        
        {deliveryDetails && (
          <Card className="bg-muted/50 dark:bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-muted-foreground/20">
                    <div className="h-0.5 bg-primary" style={{width: '50%'}}></div>
                </div>
                <StatusStep icon={<Package className="w-6 h-6" />} label="Scheduled" isCompleted={true} isCurrent={false} />
                <StatusStep icon={<TruckIcon className="w-6 h-6" />} label="In Transit" isCompleted={false} isCurrent={true} />
                <StatusStep icon={<HomeIcon className="w-6 h-6" />} label="Delivered" isCompleted={false} isCurrent={false} />
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-foreground">
                  <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Estimated Arrival:</span>
                  </div>
                  <span className="font-bold text-lg text-primary">
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


function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 18H3c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v9" />
      <path d="M14 9h4l4 4v5h-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
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
