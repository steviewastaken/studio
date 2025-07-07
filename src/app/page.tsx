
"use client";

import { useState, useCallback } from 'react';
import type { DeliveryDetails } from '@/components/dunlivrer/types';
import DeliveryForm from '@/components/dunlivrer/delivery-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, BrainCircuit, ShieldCheck, TrendingUp, Ship, Briefcase, Bot, FileText, Repeat, Shuffle, Leaf, Euro, Loader2, Milestone, Plus, Equal, Layers } from 'lucide-react';
import Image from 'next/image';
import FloatingSupportButton from '@/components/dunlivrer/floating-support-button';
import { motion } from 'framer-motion';
import LiveTrackingPreview from '@/components/dunlivrer/live-tracking-preview';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SupportChat from '@/components/dunlivrer/support-chat';
import { useLanguage } from '@/context/language-context';
import type { GetQuoteOutput } from '@/ai/flows/get-quote';
import type { GetInsuranceQuoteOutput } from '@/ai/flows/get-insurance-quote';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


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

const EstimatorBox = ({ quote, insuranceQuote, isGettingQuote }: { quote: GetQuoteOutput | null; insuranceQuote: GetInsuranceQuoteOutput | null; isGettingQuote: boolean }) => {
    const cardBaseClass = "w-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg";
    
    if (isGettingQuote) {
        return (
            <Card className={cn(cardBaseClass, "min-h-[295px]")}>
                <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="mt-4 font-semibold text-white">Calculating Estimate...</p>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Our AI is analyzing the route, traffic, and real-time conditions.
                    </p>
                </CardContent>
            </Card>
        );
    }
    
    if (!quote) {
        return (
            <Card className={cn(cardBaseClass, "min-h-[295px]")}>
                <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <span className="text-4xl">⚡️</span>
                    <p className="mt-4 font-semibold text-white">Powered by AI</p>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Estimated delivery time & cost appear here in real-time after route input.
                    </p>
                </CardContent>
            </Card>
        );
    }
    
    const totalCost = quote.price + (insuranceQuote?.premium || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <Card className={cardBaseClass}>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center justify-between">
                        <span className="flex items-center gap-2">
                           <BrainCircuit className="w-7 h-7 text-primary" /> AI Estimate
                        </span>
                        <Badge variant="outline" className="text-base">
                            {quote.etaConfidencePercentage}% Conf.
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                        <p className="text-4xl font-bold text-primary">{quote.etaConfidenceRange}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5"><Milestone className="w-3 h-3"/> Distance</p>
                            <p className="font-bold text-lg">{quote.distance}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5"><Leaf className="w-3 h-3"/> CO₂ Impact</p>
                            <p className="font-bold text-lg">{quote.co2Emission}</p>
                        </div>
                    </div>
                    
                    <Separator className="my-4"/>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Delivery Cost</span>
                            <span className="font-medium">€{quote.price.toFixed(2)}</span>
                        </div>
                        {insuranceQuote && (
                            <div className="flex justify-between items-center text-primary">
                                <span className="flex items-center gap-1.5"><Plus className="w-3 h-3"/> Insurance Premium</span>
                                <span className="font-medium">€{insuranceQuote.premium.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-dashed">
                            <span>Total</span>
                            <span>€{totalCost.toFixed(2)}</span>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    );
};


export default function DunlivrerPage() {
  const [previewAddresses, setPreviewAddresses] = useState<{pickup: string | null; destinations: string[]}>({ pickup: null, destinations: [] });
  const [quote, setQuote] = useState<GetQuoteOutput | null>(null);
  const [insuranceQuote, setInsuranceQuote] = useState<GetInsuranceQuoteOutput | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  
  const { t } = useLanguage();

  const handleAddressChange = useCallback((addresses: { pickup: string | null; destinations: string[] }) => {
    setPreviewAddresses(addresses);
    setQuote(null);
    setInsuranceQuote(null);
    setIsReviewed(false);
  }, []);

  const handleQuoteChange = (newQuote: GetQuoteOutput | null) => {
    setQuote(newQuote);
    setIsReviewed(!!newQuote);
    setInsuranceQuote(null); // Reset insurance when base quote changes
  };
  
  const investorFeatures = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: t('investorFeature1Title'),
      description: t('investorFeature1Desc'),
      color: 'primary'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-accent" />,
      title: t('investorFeature2Title'),
      description: t('investorFeature2Desc'),
      color: 'accent'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      title: t('investorFeature3Title'),
      description: t('investorFeature3Desc'),
      color: 'green'
    }
  ];

  const services = [
    {
      icon: <Ship className="w-10 h-10 text-primary" />,
      title: t('service1Title'),
      description: t('service1Desc'),
    },
    {
      icon: <Briefcase className="w-10 h-10 text-primary" />,
      title: t('service2Title'),
      description: t('service2Desc'),
    },
    {
      icon: <BrainCircuit className="w-10 h-10 text-primary" />,
      title: t('service3Title'),
      description: t('service3Desc'),
    }
  ];

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
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 pb-4" style={{ whiteSpace: 'pre-line' }}>
            {t('heroTitle')}
          </motion.h1>
          <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg text-muted-foreground">
            {t('heroSubtitle')}
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="#get-started">{t('scheduleButton')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{t('contactButton')}</Link>
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
              <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">{t('advantageTitle')}</h2>
              <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">{t('advantageHeadline')}</p>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                {t('advantageSubtitle')}
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
      
      {/* AI Fraud Detection Section */}
      <motion.section
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">
            {t('fraudTitle')}
          </h2>
          <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">
            {t('fraudHeadline')}
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            {t('fraudSubtitle')}
          </p>
          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
            variants={staggeredContainer}
          >
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {t('fraudFeature1Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('fraudFeature1Desc')}
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {t('fraudFeature2Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('fraudFeature2Desc')}
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {t('fraudFeature3Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('fraudFeature3Desc')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Blockchain Section */}
      <motion.section
        className="py-24 bg-background/20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-base font-semibold uppercase text-primary tracking-widest">
            {t('blockchainTitle')}
          </h2>
          <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">
            {t('blockchainHeadline')}
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            {t('blockchainSubtitle')}
          </p>
          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
            variants={staggeredContainer}
          >
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {t('blockchainFeature1Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('blockchainFeature1Desc')}
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {t('blockchainFeature2Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('blockchainFeature2Desc')}
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-primary/20 rounded-lg text-primary shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {t('blockchainFeature3Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('blockchainFeature3Desc')}
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
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">{t('getStartedTitle')}</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {t('getStartedSubtitle')}
                </p>
              </div>
              <motion.div whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}>
                <DeliveryForm 
                  onAddressChange={handleAddressChange}
                  onQuoteChange={handleQuoteChange}
                  onInsuranceChange={setInsuranceQuote}
                  quote={quote}
                  insuranceQuote={insuranceQuote}
                  isReviewed={isReviewed}
                  isGettingQuote={isGettingQuote}
                  setIsGettingQuote={setIsGettingQuote}
                />
              </motion.div>
              <motion.div whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}>
                  <div className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                    <Dialog>
                        <div className="flex items-center gap-3">
                            <Bot className="text-primary h-8 w-8"/>
                            <div>
                                <h3 className="font-headline text-2xl font-bold text-white">{t('trackSupportTitle')}</h3>
                                <p className="mt-1 text-muted-foreground">{t('trackSupportSubtitle')}</p>
                            </div>
                        </div>
                        <DialogTrigger asChild>
                          <Button className="mt-6" size="lg">
                              {t('trackSupportButton')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-md">
                            <DialogHeader className="sr-only">
                              <DialogTitle>{t('trackSupportTitle')}</DialogTitle>
                              <DialogDescription>
                                {t('trackSupportSubtitle')}
                              </DialogDescription>
                            </DialogHeader>
                            <SupportChat deliveryDetails={null} />
                        </DialogContent>
                    </Dialog>
                  </div>
              </motion.div>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-8">
                <motion.div whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}>
                    <LiveTrackingPreview 
                        pickupAddress={previewAddresses.pickup} 
                        destinationAddresses={previewAddresses.destinations} 
                    />
                </motion.div>
                 <EstimatorBox quote={quote} insuranceQuote={insuranceQuote} isGettingQuote={isGettingQuote} />
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
            <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">{t('solutionsTitle')}</h2>
            <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">{t('solutionsHeadline')}</p>
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
