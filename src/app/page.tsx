
"use client";

import { useState, useCallback } from 'react';
import type { DeliveryDetails } from '@/components/dunlivrer/types';
import DeliveryForm from '@/components/dunlivrer/delivery-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, BrainCircuit, ShieldCheck, TrendingUp, Ship, Briefcase, Bot, FileText, ListChecks } from 'lucide-react';
import Image from 'next/image';
import FloatingSupportButton from '@/components/dunlivrer/floating-support-button';
import { motion } from 'framer-motion';
import LiveTrackingPreview from '@/components/dunlivrer/live-tracking-preview';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import SupportChat from '@/components/dunlivrer/support-chat';

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
];

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    } 
  },
};

const staggeredContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function DunlivrerPage() {
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [etaResult, setEtaResult] = useState<EtaResult>(null);
  const [previewAddresses, setPreviewAddresses] = useState<{pickup: string | null; destinations: string[]}>({ pickup: null, destinations: [] });

  const handleNewDelivery = useCallback((details: DeliveryDetails, eta: NonNullable<EtaResult>) => {
    setDeliveryDetails(details);
    setEtaResult(eta);
    // Potentially redirect to tracking page or show a success modal
  }, []);
  
  const handleAddressChange = useCallback((addresses: { pickup: string | null; destinations: string[] }) => {
    setPreviewAddresses(addresses);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section 
        className="relative text-center pt-32 pb-16 w-full max-w-7xl mx-auto px-4 md:px-8"
        initial="hidden"
        animate="visible"
        variants={staggeredContainer}
      >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 pb-4">
            The Future of Logistics,
            <br />
            Delivered Today.
          </motion.h1>
          <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg text-muted-foreground">
            Dunlivrer is an AI-first technology company revolutionizing the delivery industry. We provide unparalleled speed, reliability, and efficiency for both consumers and businesses.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="#get-started">Schedule a Delivery</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
          </motion.div>
      </motion.section>

      {/* Investor-Focused "Why Us" Section */}
      <motion.section 
        className="py-16 bg-background/20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">The Dunlivrer Advantage</h2>
              <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">Investing in Intelligent Infrastructure</p>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                We're not just moving packages; we're building the intelligent, automated backbone of modern commerce.
              </p>
            </div>
            <motion.div 
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggeredContainer}
            >
              {investorFeatures.map((feature) => (
                 <motion.div 
                    key={feature.title}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg flex flex-col items-start gap-4 h-full"
                  >
                  {feature.icon}
                  <h3 className="text-xl font-bold font-headline text-white">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                 </motion.div>
              ))}
            </motion.div>
        </div>
      </motion.section>

      {/* Blockchain Section */}
      <motion.section
        className="py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="w-full max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">
            Built on Trust
          </h2>
          <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">
            Blockchain-Verified Logistics
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            To provide ultimate transparency and security, every step of the
            delivery process can be recorded on a secure, immutable blockchain
            ledger. This builds unparalleled trust for high-value shipments and
            sensitive enterprise logistics.
          </p>
          <motion.div
            className="mt-12 space-y-8"
            variants={staggeredContainer}
          >
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4 text-left"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  Immutable Record
                </h3>
                <p className="text-muted-foreground">
                  Every pickup, handoff, and delivery signature is permanently
                  and verifiably recorded, eliminating disputes.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4 text-left"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  Automated Smart Contracts
                </h3>
                <p className="text-muted-foreground">
                  Payment releases and compliance checks are automated upon
                  verified delivery, reducing overhead.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4 text-left"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <ListChecks className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  Real-Time Audits
                </h3>
                <p className="text-muted-foreground">
                  Stakeholders can independently verify the delivery trail at
                  any time, ensuring complete accountability.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Delivery Form Section */}
      <motion.section 
        id="get-started" 
        className="py-24 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="absolute inset-0 -z-10">
            <Image src="https://placehold.co/1920x1080.png" fill alt="Abstract background" className="opacity-10 object-cover" data-ai-hint="abstract network" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-3 flex flex-col gap-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">Ready to Ship?</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Experience the difference. Get an instant, AI-powered ETA and quote for your delivery. Fast, transparent, and reliable.
                </p>
              </div>
              <motion.div whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}>
                <DeliveryForm onNewDelivery={handleNewDelivery} onAddressChange={handleAddressChange} />
              </motion.div>
              <motion.div whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}>
                  <div className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                    <Dialog>
                        <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-3">
                        <Bot className="text-primary"/> Track & Support
                        </h3>
                        <p className="mt-2 text-muted-foreground">Already have a delivery in progress? Chat with our AI assistant for real-time updates and support.</p>
                        <DialogTrigger asChild>
                          <Button className="mt-6" size="lg">
                              Track & Chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-md">
                            <SupportChat deliveryDetails={null} />
                        </DialogContent>
                    </Dialog>
                  </div>
              </motion.div>
            </div>
            <div className="lg:col-span-2">
                <motion.div whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}>
                    <LiveTrackingPreview 
                        pickupAddress={previewAddresses.pickup} 
                        destinationAddresses={previewAddresses.destinations} 
                    />
                </motion.div>
            </div>
        </div>
      </motion.section>

       {/* Services Section */}
      <motion.section 
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">Our Solutions</h2>
            <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">Logistics for Everyone</p>
            <motion.div 
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
              variants={staggeredContainer}
            >
              {services.map((service) => (
                 <motion.div 
                    key={service.title} 
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-lg flex flex-col items-start gap-4 h-full"
                  >
                  {service.icon}
                  <h3 className="text-xl font-bold font-headline text-white">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                 </motion.div>
              ))}
            </motion.div>
        </div>
      </motion.section>
      <FloatingSupportButton />
    </div>
  );
}
