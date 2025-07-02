"use client";

import { useState } from 'react';
import type { DeliveryDetails } from '@/components/dunlivrer/types';
import DeliveryForm from '@/components/dunlivrer/delivery-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, BrainCircuit, ShieldCheck, TrendingUp, Ship, Briefcase, Bot } from 'lucide-react';
import Image from 'next/image';

export type EtaResult = {
  estimatedTime: string;
  confidence: number;
} | null;

const investorFeatures = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: 'Proprietary AI Engine',
    description: 'Our core is a self-learning logistics model that optimizes routes, predicts traffic, and allocates resources with superhuman efficiency, reducing delivery times by up to 30%.',
    color: 'primary'
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-accent" />,
    title: 'Scalable Market-Fit',
    description: 'Tapping into a multi-billion dollar last-mile delivery market, our model is designed for rapid horizontal and vertical scaling across cities and industries.',
    color: 'accent'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
    title: 'High-Margin Operations',
    description: 'AI-driven efficiency translates directly to lower operational costs, higher driver utilization, and industry-leading profit margins per delivery.',
    color: 'green'
  }
];

const services = [
  {
    icon: <Ship className="w-10 h-10 text-primary" />,
    title: 'Hyperlocal & B2C',
    description: 'On-demand delivery for individuals and local businesses. From documents to dinner, delivered in minutes.',
  },
  {
    icon: <Briefcase className="w-10 h-10 text-primary" />,
    title: 'B2B & Enterprise',
    description: 'Robust logistics solutions for businesses. We handle supply chain, last-mile fulfillment, and more.',
  },
  {
    icon: <Zap className="w-10 h-10 text-primary" />,
    title: 'API for Developers',
    description: 'Integrate Dunlivrer\'s logistics power directly into your app or e-commerce platform.',
  }
]

export default function DunlivrerPage() {
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [etaResult, setEtaResult] = useState<EtaResult>(null);

  const handleNewDelivery = (details: DeliveryDetails, eta: NonNullable<EtaResult>) => {
    setDeliveryDetails(details);
    setEtaResult(eta);
    // Potentially redirect to tracking page or show a success modal
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative text-center pt-32 pb-16 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <h1 className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 pb-4">
            The Future of Logistics,
            <br />
            Delivered Today.
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            Dunlivrer is an AI-first technology company revolutionizing the delivery industry. We provide unparalleled speed, reliability, and efficiency for both consumers and businesses.
          </p>
          <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="#get-started">Schedule a Delivery</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
          </div>
      </section>

      {/* Investor-Focused "Why Us" Section */}
      <section className="py-16 bg-background/20">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">The Dunlivrer Advantage</h2>
              <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">Investing in Intelligent Infrastructure</p>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                We're not just moving packages; we're building the intelligent, automated backbone of modern commerce.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {investorFeatures.map((feature) => (
                 <div key={feature.title} className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg flex flex-col items-start gap-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold font-headline text-white">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                 </div>
              ))}
            </div>
        </div>
      </section>

      {/* Delivery Form Section */}
      <section id="get-started" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
            <Image src="https://placehold.co/1920x1080.png" layout="fill" objectFit="cover" alt="Abstract background" className="opacity-10" data-ai-hint="abstract network" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">Ready to Ship?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Experience the difference. Get an instant, AI-powered ETA and quote for your delivery. Fast, transparent, and reliable.
              </p>
              <div className="mt-8">
                <DeliveryForm onNewDelivery={handleNewDelivery} />
              </div>
            </div>
            <div className="lg:col-span-1">
                <div className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                    <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-3">
                      <Bot className="text-primary"/> Track & Support
                    </h3>
                    <p className="mt-2 text-muted-foreground">Already have a delivery in progress? Head over to our tracking page for real-time updates and AI-powered support.</p>
                    <Button asChild className="mt-6" size="lg">
                        <Link href="/tracking">Track & Chat</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>

       {/* Services Section */}
      <section className="py-16">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">Our Solutions</h2>
            <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">Logistics for Everyone</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {services.map((service) => (
                 <div key={service.title} className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-lg flex flex-col items-start gap-4">
                  {service.icon}
                  <h3 className="text-xl font-bold font-headline text-white">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                 </div>
              ))}
            </div>
        </div>
      </section>
    </div>
  );
}
