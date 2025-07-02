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
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <DeliveryForm onNewDelivery={handleNewDelivery} />
            <SupportChat deliveryDetails={deliveryDetails} />
          </div>
          <div className="lg:col-span-3">
            <TrackingMap deliveryDetails={deliveryDetails} etaResult={etaResult} />
          </div>
        </div>
      </main>
    </div>
  );
}
