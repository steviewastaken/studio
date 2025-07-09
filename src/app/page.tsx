
"use client";

import { useState, useCallback, useRef } from 'react';
import type { DeliveryDetails } from '@/components/dunlivrer/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, BrainCircuit, ShieldCheck, TrendingUp, Ship, Briefcase, Bot, FileText, Repeat, Shuffle, Leaf, Euro, Loader2, Milestone, Plus, Layers, Upload, Route, Lightbulb, Package, Truck, AlertTriangle, Package2 } from 'lucide-react';
import Image from 'next/image';
import FloatingSupportButton from '@/components/dunlivrer/floating-support-button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/language-context';
import type { GetQuoteOutput } from '@/ai/flows/get-quote';
import type { GetInsuranceQuoteOutput } from '@/ai/flows/get-insurance-quote';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Papa from 'papaparse';
import { useToast } from "@/hooks/use-toast";
import { handleProcessBulkDelivery } from "@/lib/bulk-actions";
import type { ProcessBulkDeliveryOutput } from '@/ai/flows/process-bulk-delivery';
import { useJobs, type Job } from "@/context/jobs-context";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


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

const DeliveryForm = dynamic(
    () => import('@/components/dunlivrer/delivery-form'),
    { ssr: false, loading: () => <Skeleton className="h-[500px] w-full" /> }
);

const LiveTrackingPreview = dynamic(
    () => import('@/components/dunlivrer/live-tracking-preview'),
    { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);


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


const sampleCsvData = `destination_address,package_weight_kg,notes
"Eiffel Tower, Paris, France",4.5,"VIP delivery"
"Louvre Museum, Paris, France",1.2,"Fragile item"
"5 Rue de Rivoli, 75004 Paris",0.8,""
"Arc de Triomphe, Paris",8.0,"Requires 2 people"
"221B Baker Street, London",3.0,"Address outside primary zone"
"Montmartre, Paris, France",15.5,"Weekly restock for cafe"
"La Défense, Puteaux",2.0,"Office documents"
"Montmartre, Paris, France",6.7,"Second package for cafe"`;

const BulkUploader = ({ onProcess }: { onProcess: (csv: string) => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleProcess = () => {
        if (!file) return;
        setIsProcessing(true);
        Papa.parse(file, {
            complete: (results) => {
                const csvString = Papa.unparse(results.data);
                onProcess(csvString);
                setIsProcessing(false);
            },
            error: (err) => {
                console.error("CSV parsing error:", err);
                setIsProcessing(false);
            }
        });
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([sampleCsvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "dunlivrer_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUseSampleData = () => {
        onProcess(sampleCsvData);
    };

    return (
        <Card className="w-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-3"><Layers className="text-primary"/>Book Multiple Deliveries</CardTitle>
                <CardDescription>Upload a CSV file with your deliveries to get an optimized dispatch plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div 
                    className="relative w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors bg-muted/20"
                    onClick={() => inputRef.current?.click()}
                >
                    <input type="file" ref={inputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
                    {file ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                            <FileText className="w-8 h-8"/>
                            <p className="text-sm font-semibold">{file.name}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="w-8 h-8"/>
                            <p className="text-sm">Click or drag to upload a CSV file</p>
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                     <Button onClick={handleProcess} disabled={!file || isProcessing} className="w-full" size="lg">
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <BrainCircuit className="mr-2"/>}
                        {isProcessing ? "Parsing..." : "Generate AI Dispatch Plan"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have a file?{' '}
                        <Button variant="link" className="p-0 h-auto" onClick={handleUseSampleData}>Use sample data</Button>
                        {' '}or{' '}
                        <Button variant="link" className="p-0 h-auto" onClick={handleDownloadTemplate}>download the template</Button>.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const BulkResultsDisplay = ({ result, onDispatch }: { result: ProcessBulkDeliveryOutput, onDispatch: () => void }) => {
    return (
        <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="bg-green-500/10 border-green-500/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3"><Euro className="text-green-400"/>Total Quote</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-white">
                            €{result.uploadSummary.totalQuote.toFixed(2)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            For {result.uploadSummary.validPackages} valid deliveries. {result.uploadSummary.invalidPackages > 0 && `(${result.uploadSummary.invalidPackages} excluded).`}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3"><Lightbulb className="text-primary"/>AI Smart Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{result.smartPricingSuggestion.reason}</p>
                        <div className="mt-4 p-4 rounded-lg bg-primary/20 text-center">
                            <p>Suggested Window: <span className="font-bold">{result.smartPricingSuggestion.window}</span></p>
                            <p className="text-2xl font-bold text-primary">Save ~{result.smartPricingSuggestion.savingsPercentage}%</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-accent/10 border-accent/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3"><Zap className="text-accent"/>AI Demand Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{result.demandForecast.prediction}</p>
                        <div className="mt-4 text-center">
                             <Badge variant="outline" className="border-accent/50 text-accent bg-accent/20">
                                Confidence: {result.demandForecast.confidence}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/80 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Route/> AI Route Consolidation</CardTitle>
                    <CardDescription>
                        {result.uploadSummary.totalPackages} packages grouped into {result.uploadSummary.uniqueZones} optimized zones.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {result.consolidatedRoutes.map((route, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-muted">
                            <h3 className="font-semibold text-white">Zone: {route.zone} ({route.addresses.length} packages)</h3>
                            <p className="text-sm text-muted-foreground italic mt-1">"{route.routeSuggestion}"</p>
                            <ul className="mt-3 list-disc list-inside text-xs space-y-1">
                                {route.addresses.map((addr, i) => <li key={i}>{addr}</li>)}
                            </ul>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full" onClick={onDispatch}>
                        <Truck className="mr-2"/> Dispatch All Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
};


export default function HomePage() {
  const [previewAddresses, setPreviewAddresses] = useState<{pickup: string | null; destinations: string[]}>({ pickup: null, destinations: [] });
  const [quote, setQuote] = useState<GetQuoteOutput | null>(null);
  const [insuranceQuote, setInsuranceQuote] = useState<GetInsuranceQuoteOutput | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  
  // State for bulk uploader
  const [bulkAnalysisResult, setBulkAnalysisResult] = useState<ProcessBulkDeliveryOutput | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const { toast } = useToast();
  const { addJobs } = useJobs();

  const { content } = useLanguage();

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

  const handleProcessCSV = useCallback(async (csvData: string) => {
    setIsBulkLoading(true);
    setBulkError(null);
    setBulkAnalysisResult(null);

    const result = await handleProcessBulkDelivery({ csvData });
    if (result.success && result.data) {
        setBulkAnalysisResult(result.data);
        toast({ title: "Dispatch Plan Generated!", description: "Review the AI-powered suggestions below."});
    } else {
        setBulkError(result.error || "Failed to process the CSV file.");
    }
    setIsBulkLoading(false);
  }, [toast]);

  const handleDispatchBulk = () => {
    if (!bulkAnalysisResult) return;

    const newJobs: Job[] = bulkAnalysisResult.consolidatedRoutes.map((route, index) => {
        const payout = (10 + route.addresses.length * 2.5 + Math.random() * 5).toFixed(2);
        const time = (15 + route.addresses.length * 5 + Math.random() * 10).toFixed(0);

        return {
            id: `job-bulk-${Date.now()}-${index}`,
            pickup: `Multiple pickups in ${route.zone}`,
            dropoff: `Multiple dropoffs in ${route.zone}`,
            distance: `${(5 + route.addresses.length * 1.5).toFixed(1)} km`,
            payout: payout,
            time: `${time} min`,
            suggestion: `Consolidated route with ${route.addresses.length} stops. Good for zone efficiency.`,
            suggestionType: 'accept'
        };
    });

    addJobs(newJobs);

    toast({
        title: "Plan Dispatched!",
        description: `${newJobs.length} consolidated delivery jobs have been posted to nearby DunGuys.`
    });
    
    // Reset the UI
    setBulkAnalysisResult(null);
  };
  
  const investorFeatures = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: content.investorFeature1Title,
      description: content.investorFeature1Desc,
      color: 'primary'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-accent" />,
      title: content.investorFeature2Title,
      description: content.investorFeature2Desc,
      color: 'accent'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      title: content.investorFeature3Title,
      description: content.investorFeature3Desc,
      color: 'green'
    }
  ];

  const services = [
    {
      icon: <Ship className="w-10 h-10 text-primary" />,
      title: content.service1Title,
      description: content.service1Desc,
    },
    {
      icon: <Briefcase className="w-10 h-10 text-primary" />,
      title: content.service2Title,
      description: content.service2Desc,
    },
    {
      icon: <BrainCircuit className="w-10 h-10 text-primary" />,
      title: content.service3Title,
      description: content.service3Desc,
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
            {content.heroTitle}
          </motion.h1>
          <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg text-muted-foreground">
            {content.heroSubtitle}
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="#get-started">{content.scheduleButton}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{content.contactButton}</Link>
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
              <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">{content.advantageTitle}</h2>
              <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">{content.advantageHeadline}</p>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                {content.advantageSubtitle}
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
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">{content.getStartedTitle}</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {content.getStartedSubtitle}
                </p>
              </div>
              
              <AnimatePresence mode="wait">
                {isBulkLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-12 space-y-4">
                        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                        <h3 className="font-semibold text-xl">AI Engine is processing your manifest...</h3>
                        <p className="text-muted-foreground">Consolidating routes, calculating smart pricing, and forecasting demand.</p>
                    </motion.div>
                ) : bulkError ? (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="bg-destructive/10 border-destructive/30 p-8 text-center text-destructive">
                             <AlertTriangle className="w-12 h-12 mx-auto" />
                             <h2 className="mt-4 text-2xl font-bold">Analysis Failed</h2>
                             <p>{bulkError}</p>
                             <Button variant="outline" onClick={() => setBulkError(null)} className="mt-4">Try Again</Button>
                        </Card>
                    </motion.div>
                ) : bulkAnalysisResult ? (
                     <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <BulkResultsDisplay result={bulkAnalysisResult} onDispatch={handleDispatchBulk} />
                    </motion.div>
                ) : (
                    <motion.div key="tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Tabs defaultValue="single-delivery" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-lg">
                                <TabsTrigger value="single-delivery"><Package className="mr-2"/>Single Delivery</TabsTrigger>
                                <TabsTrigger value="bulk-upload"><Layers className="mr-2"/>Bulk Upload</TabsTrigger>
                            </TabsList>
                            <TabsContent value="single-delivery" className="mt-6">
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
                            </TabsContent>
                            <TabsContent value="bulk-upload" className="mt-6">
                                 <BulkUploader onProcess={handleProcessCSV} />
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                )}
              </AnimatePresence>
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
            <h2 className="text-sm font-semibold uppercase text-primary tracking-widest">{content.solutionsTitle}</h2>
            <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">{content.solutionsHeadline}</p>
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
            {content.fraudTitle}
          </h2>
          <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">
            {content.fraudHeadline}
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            {content.fraudSubtitle}
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
                  {content.fraudFeature1Title}
                </h3>
                <p className="text-muted-foreground">
                  {content.fraudFeature1Desc}
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
                  {content.fraudFeature2Title}
                </h3>
                <p className="text-muted-foreground">
                  {content.fraudFeature2Desc}
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
                  {content.fraudFeature3Title}
                </h3>
                <p className="text-muted-foreground">
                  {content.fraudFeature3Desc}
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
            {content.blockchainTitle}
          </h2>
          <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-white">
            {content.blockchainHeadline}
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            {content.blockchainSubtitle}
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
                  {content.blockchainFeature1Title}
                </h3>
                <p className="text-muted-foreground">
                  {content.blockchainFeature1Desc}
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
                  {content.blockchainFeature2Title}
                </h3>
                <p className="text-muted-foreground">
                  {content.blockchainFeature2Desc}
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
                  {content.blockchainFeature3Title}
                </h3>
                <p className="text-muted-foreground">
                  {content.blockchainFeature3Desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <FloatingSupportButton />
    </div>
  );
}
