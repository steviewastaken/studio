"use client";

import { useState } from 'react';
import type { DeliveryDetails } from '@/components/dunlivrer/types';
import SupportChat from '@/components/dunlivrer/support-chat';
import TrackingMap from '@/components/dunlivrer/tracking-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type EtaResult = {
  estimatedTime: string;
  confidence: number;
} | null;

// Mock data until we have a backend
const mockDelivery: DeliveryDetails = {
    pickupAddress: '123 Main St, Anytown, USA',
    destinationAddresses: ['456 Business Ave, Anytown, USA', '101 City Center, Anytown, USA'],
    packageSize: 'medium'
};

const mockEta: NonNullable<EtaResult> = {
    estimatedTime: '45',
    confidence: 0.88
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


export default function TrackingPage() {
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [etaResult, setEtaResult] = useState<EtaResult>(null);
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setDeliveryDetails(mockDelivery);
        setEtaResult(mockEta);
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
        <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
        >
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">Order Tracking &amp; AI Support</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Enter your tracking ID for real-time status, or ask our AI assistant for help.
            </p>
        </motion.div>

        <motion.div 
            className="mt-12 grid gap-8 lg:grid-cols-5 items-start"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
        >
            <motion.div className="lg:col-span-3 flex flex-col gap-8" variants={itemVariants}>
                <TrackingMap deliveryDetails={deliveryDetails} etaResult={etaResult} />
            </motion.div>
            <motion.div className="lg:col-span-2 flex flex-col gap-8" variants={itemVariants}>
                 <Card className="bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                    <CardHeader>
                        <CardTitle>Track your package</CardTitle>
                        <CardDescription>Enter the tracking ID provided in your confirmation.</CardDescription>
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
                                {isLoading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2"/>Track</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <SupportChat deliveryDetails={deliveryDetails} />
            </motion.div>
        </motion.div>
    </div>
  );
}
