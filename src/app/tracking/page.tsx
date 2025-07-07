
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import type { DeliveryDetails } from '@/components/dunlivrer/types';
import SupportChat from '@/components/dunlivrer/support-chat';
import TrackingMap from '@/components/dunlivrer/tracking-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, RefreshCw, AlertCircle, CheckCircle, Euro, Timer, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FindDriverOutput } from '@/ai/flows/find-driver';
import type { RerouteDeliveryOutput } from '@/ai/flows/reroute-delivery';
import { handleFindDriver, handleRerouteDelivery } from '@/lib/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input as AddressInput } from '@/components/ui/input'; // Using regular input
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

const mockDelivery: DeliveryDetails = {
    pickupAddress: 'Rue de Rivoli, 75001 Paris, France', // Louvre Museum
    destinationAddresses: ['Champ de Mars, 5 Av. Anatole France, 75007 Paris, France'], // Eiffel Tower
    packageSize: 'medium',
    deliveryType: 'standard'
};


const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.2
    } 
  },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' }}
}

export type DeliveryStatus = 'IDLE' | 'SEARCHING' | 'FOUND' | 'IN_TRANSIT' | 'DELIVERED';

function TrackingPageContent() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [driverDetails, setDriverDetails] = useState<FindDriverOutput | null>(null);
  const [trackingId, setTrackingId] = useState('DUN12345XYZ');
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('IDLE');

  // State for rerouting
  const [isRerouting, setIsRerouting] = useState(false);
  const [newDestination, setNewDestination] = useState("");
  const [isCheckingReroute, setIsCheckingReroute] = useState(false);
  const [rerouteResult, setRerouteResult] = useState<RerouteDeliveryOutput | null>(null);

  const progressTimeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Clear any pending simulations when component unmounts
  useEffect(() => {
    return () => {
      progressTimeoutRefs.current.forEach(clearTimeout);
    };
  }, []);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;

    // Clear previous simulation timeouts
    progressTimeoutRefs.current.forEach(clearTimeout);
    progressTimeoutRefs.current = [];

    setIsLoading(true);
    setDeliveryStatus('SEARCHING');
    
    // Reset state for new search
    setDeliveryDetails(null);
    setDriverDetails(null);
    
    // Simulate API call to get delivery details
    await new Promise(resolve => setTimeout(resolve, 500));
    setDeliveryDetails(mockDelivery);

    // Find a driver for the mock delivery
    const driverResult = await handleFindDriver({ pickupAddress: mockDelivery.pickupAddress });
    setIsLoading(false);

    if (driverResult.success && driverResult.data) {
        setDriverDetails(driverResult.data);
        setDeliveryStatus('FOUND');

        // Simulate further progress
        const inTransitTimeout = setTimeout(() => setDeliveryStatus('IN_TRANSIT'), 4000);
        const deliveredTimeout = setTimeout(() => setDeliveryStatus('DELIVERED'), 9000);
        progressTimeoutRefs.current = [inTransitTimeout, deliveredTimeout];

    } else {
        // Handle error: Reset status if driver not found
        setDeliveryStatus('IDLE');
    }
  };

  const remainingOriginalEtaMinutes = useMemo(() => {
    if (!driverDetails?.driverEta) return 0;
    return parseInt(driverDetails.driverEta.split(' ')[0] || '0');
  }, [driverDetails]);

  const handleCheckNewRoute = async () => {
    if (!newDestination || !deliveryDetails?.destinationAddresses[0]) return;
    setIsCheckingReroute(true);
    setRerouteResult(null);

    const result = await handleRerouteDelivery({
        originalDestination: deliveryDetails.destinationAddresses[0],
        newDestination,
        remainingOriginalEtaMinutes: remainingOriginalEtaMinutes,
    });

    if (result.success && result.data) {
        setRerouteResult(result.data);
    } else {
        toast({
            variant: "destructive",
            title: "Reroute Check Failed",
            description: result.error,
        })
    }
    setIsCheckingReroute(false);
  }

  const handleConfirmReroute = () => {
    if (!rerouteResult || !deliveryDetails) return;
    
    // Update delivery details with the new destination
    setDeliveryDetails({
        ...deliveryDetails,
        destinationAddresses: [newDestination],
    });

    // Update driver ETA
    if (driverDetails) {
        setDriverDetails({
            ...driverDetails,
            driverEta: `${rerouteResult.newTotalEtaMinutes} minutes`
        });
    }

    toast({
        title: "Route Updated!",
        description: `New destination confirmed. Additional cost: €${rerouteResult.additionalCost.toFixed(2)}`,
    });

    // Reset and close dialog
    setIsRerouting(false);
    setNewDestination("");
    setRerouteResult(null);
  };

  const openRerouteDialog = () => {
      setNewDestination("");
      setRerouteResult(null);
      setIsRerouting(true);
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
          <motion.div 
              className="text-center"
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
          >
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">{t('tracking_title')}</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                  {t('tracking_subtitle')}
              </p>
          </motion.div>

          <motion.div 
              className="mt-12 grid gap-8 lg:grid-cols-5 items-start"
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
          >
              <motion.div className="lg:col-span-3 flex flex-col gap-8" variants={itemVariants}>
                  <TrackingMap 
                      deliveryDetails={deliveryDetails} 
                      driverDetails={driverDetails} 
                      deliveryStatus={deliveryStatus} 
                      onRerouteRequest={openRerouteDialog}
                  />
              </motion.div>
              <motion.div className="lg:col-span-2 flex flex-col gap-8" variants={itemVariants}>
                  <Card className="bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                      <CardHeader>
                          <CardTitle>{t('tracking_box_title')}</CardTitle>
                          <CardDescription>{t('tracking_box_desc')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <form onSubmit={handleSearch} className="flex gap-2">
                              <Input 
                                  placeholder="e.g., DUN12345XYZ" 
                                  className="h-12 text-base"
                                  value={trackingId}
                                  onChange={(e) => setTrackingId(e.target.value)}
                                  disabled={isLoading}
                              />
                              <Button type="submit" size="lg" disabled={isLoading || !trackingId}>
                                  {isLoading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2"/>{t('tracking_box_button')}</>}
                              </Button>
                          </form>
                      </CardContent>
                  </Card>
                    {deliveryDetails && deliveryStatus !== 'IDLE' && (
                        <Card className="bg-card/80 border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-primary"/>Smart Contract Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${deliveryStatus === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {deliveryStatus === 'DELIVERED' ? <CheckCircle className="w-5 h-5"/> : <Loader2 className="w-5 h-5 animate-spin"/>}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{deliveryStatus === 'DELIVERED' ? 'Payment Released' : 'Funds in Escrow'}</p>
                                        <p className="text-sm text-muted-foreground">{deliveryStatus === 'DELIVERED' ? 'Payment sent to driver.' : 'Payment secured on-chain.'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                  <SupportChat deliveryDetails={deliveryDetails} />
              </motion.div>
          </motion.div>
          
          {deliveryStatus === 'DELIVERED' && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-6 h-6" /> Delivery Verified On-Chain
                    </CardTitle>
                    <CardDescription>
                      This delivery's chain of custody has been permanently recorded and payment has been released via Smart Contract.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/tx/0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b">
                        View On-Chain Record
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
      </div>
      
      <Dialog open={isRerouting} onOpenChange={setIsRerouting}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl flex items-center gap-2"><RefreshCw className="text-primary"/>{t('tracking_reroute_button')}</DialogTitle>
                <DialogDescription>
                    Enter a new address below to get an updated quote and ETA from our AI assistant.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="new-destination">New Destination Address</Label>
                    <AddressInput
                        id="new-destination"
                        placeholder="Enter new address..."
                        value={newDestination}
                        onChange={(e) => setNewDestination(e.target.value)}
                        disabled={isCheckingReroute}
                    />
                </div>
                <Button onClick={handleCheckNewRoute} disabled={!newDestination || isCheckingReroute} className="w-full">
                    {isCheckingReroute ? <Loader2 className="mr-2 animate-spin"/> : null}
                    {isCheckingReroute ? 'Analyzing New Route...' : 'Calculate Reroute'}
                </Button>
            </div>

            {rerouteResult && (
                <div className="mt-4 p-4 border rounded-lg bg-muted animate-in fade-in-0">
                    <h4 className="font-semibold mb-3">Rerouting Proposal</h4>
                    {rerouteResult.isFeasible ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-green-500">
                                <CheckCircle className="w-5 h-5"/>
                                <p className="font-medium">This route is feasible.</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{rerouteResult.reason}</p>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 bg-background rounded-md text-center">
                                    <p className="text-xs text-muted-foreground">Additional Cost</p>
                                    <p className="text-lg font-bold flex items-center justify-center gap-1"><Euro className="w-4 h-4"/> {rerouteResult.additionalCost.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-background rounded-md text-center">
                                    <p className="text-xs text-muted-foreground">New ETA</p>
                                    <p className="text-lg font-bold flex items-center justify-center gap-1.5"><Timer className="w-4 h-4"/> {rerouteResult.newTotalEtaMinutes} min</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="space-y-2">
                            <div className="flex items-center gap-3 text-destructive">
                                <AlertCircle className="w-5 h-5"/>
                                <p className="font-medium">Rerouting Not Possible</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{rerouteResult.reason}</p>
                        </div>
                    )}
                </div>
            )}
            
            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsRerouting(false)}>Cancel</Button>
                <Button onClick={handleConfirmReroute} disabled={!rerouteResult || !rerouteResult.isFeasible}>
                    Confirm New Route
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TrackingPage() {
  return <TrackingPageContent />
}
