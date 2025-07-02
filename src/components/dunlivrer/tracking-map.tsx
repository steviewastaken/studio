
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DeliveryDetails } from "./types";
import { MapPin, Package, Clock, CheckCircle2, Truck, Home, ArrowRight } from "lucide-react";
import MapComponent from "./map-component";
import type { FindDriverOutput } from "@/ai/flows/find-driver";

type TrackingMapProps = {
  deliveryDetails: DeliveryDetails | null;
  driverDetails: FindDriverOutput | null;
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

export default function TrackingMap({ deliveryDetails, driverDetails }: TrackingMapProps) {
  const pickup = deliveryDetails?.pickupAddress ?? null;
  const destinations = deliveryDetails?.destinationAddresses ?? [];
  
  return (
    <Card className="w-full h-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-3"><MapPin className="text-primary"/> Live Tracking</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-[16/10] bg-muted/50 rounded-lg overflow-hidden border border-white/10">
          <MapComponent 
            pickupAddress={pickup}
            destinationAddresses={destinations}
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
                    <p className="font-semibold mt-4 text-lg">No Active Delivery</p>
                    <p className="text-sm text-muted-foreground">Enter a tracking ID to see its route.</p>
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
                <StatusStep icon={<Home className="w-6 h-6" />} label="Delivered" isCompleted={false} isCurrent={false} />
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between items-center text-foreground">
                  <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Estimated Arrival:</span>
                  </div>
                  <span className="font-bold text-xl text-primary">
                    {driverDetails ? `${driverDetails.driverEta} min` : 'Calculating...'}
                  </span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
