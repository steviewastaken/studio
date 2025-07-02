"use client";

import { useState } from 'react';
import type { DeliveryDetails } from '@/components/dunlivrer/types';
import Header from '@/components/dunlivrer/header';
import DeliveryForm from '@/components/dunlivrer/delivery-form';
import SupportChat from '@/components/dunlivrer/support-chat';
import TrackingMap from '@/components/dunlivrer/tracking-map';

export type EtaResult = {
  estimatedTime: string;
  confidence: number;
} | null;

export default function DunlivrerPage() {
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [etaResult, setEtaResult] = useState<EtaResult>(null);

  const handleNewDelivery = (details: DeliveryDetails, eta: NonNullable<EtaResult>) => {
    setDeliveryDetails(details);
    setEtaResult(eta);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground font-body">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="relative text-center pt-24 pb-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <h1 className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 pb-4">
              Instant Delivery,
              <br />
              Intelligently Done.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Dunlivrer uses AI to provide the fastest, most reliable delivery ETAs. Schedule your package and watch it fly.
            </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5 items-start">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <DeliveryForm onNewDelivery={handleNewDelivery} />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-8">
            <TrackingMap deliveryDetails={deliveryDetails} etaResult={etaResult} />
            <SupportChat deliveryDetails={deliveryDetails} />
          </div>
        </div>
      </main>
      <footer className="w-full max-w-7xl mx-auto p-4 md:p-8 text-center text-sm text-muted-foreground">
        <p>Powered by AI. Delivered by Dunlivrer.</p>
      </footer>
    </div>
  );
}
