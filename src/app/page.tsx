
"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bot, Briefcase, FileText, Package2, ShieldAlert, Truck, UploadCloud, TrendingUp, X, CheckCircle, BrainCircuit, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DeliveryForm from '@/components/dunlivrer/delivery-form';
import LiveTrackingPreview from '@/components/dunlivrer/live-tracking-preview';
import type { GetQuoteOutput } from '@/ai/flows/get-quote';
import type { GetInsuranceQuoteOutput } from '@/ai/flows/get-insurance-quote';
import FloatingSupportButton from '@/components/dunlivrer/floating-support-button';
import { useLanguage } from '@/context/language-context';
import MainLayout from '@/components/dunlivrer/main-layout';
import * as Papa from 'papaparse';
import { handleProcessBulkDelivery } from '@/lib/actions';
import type { ProcessBulkDeliveryOutput } from '@/ai/flows/process-bulk-delivery';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useJobs } from '@/context/jobs-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const staggeredContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    },
  },
};

// --- Sub-components for the homepage ---

const HeroSection = () => {
  const { content } = useLanguage();
  return (
    <motion.section
      className="text-center w-full max-w-4xl mx-auto px-4 md:px-8"
      initial="hidden"
      animate="visible"
      variants={staggeredContainer}
    >
      <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold font-headline text-white leading-tight" dangerouslySetInnerHTML={{ __html: content.heroTitle.replace('\n', '<br/>') }} />
      <motion.p variants={itemVariants} className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
        {content.heroSubtitle}
      </motion.p>
      <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
        <Button size="lg" asChild>
          <a href="#get-started">{content.scheduleButton}</a>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/contact">{content.contactButton}</Link>
        </Button>
      </motion.div>
    </motion.section>
  )
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-card/50 border border-white/10 shadow-lg flex flex-col items-start gap-4 h-full">
    <div className="p-3 bg-primary/20 rounded-lg text-primary">{icon}</div>
    <h3 className="text-xl font-bold font-headline text-white">{title}</h3>
    <p className="text-muted-foreground flex-grow">{description}</p>
  </motion.div>
);

const FeaturesSection = () => {
    const { content } = useLanguage();
    const sections = [
        {
            title: content.advantageTitle,
            headline: content.advantageHeadline,
            subtitle: content.advantageSubtitle,
            features: [
                { icon: <BrainCircuit className="w-8 h-8"/>, title: content.investorFeature1Title, description: content.investorFeature1Desc },
                { icon: <TrendingUp className="w-8 h-8"/>, title: content.investorFeature2Title, description: content.investorFeature2Desc },
                { icon: <Zap className="w-8 h-8"/>, title: content.investorFeature3Title, description: content.investorFeature3Desc },
            ]
        },
        {
            title: content.fraudTitle,
            headline: content.fraudHeadline,
            subtitle: content.fraudSubtitle,
            features: [
                { icon: <ShieldAlert className="w-8 h-8"/>, title: content.fraudFeature1Title, description: content.fraudFeature1Desc },
                { icon: <TrendingUp className="w-8 h-8"/>, title: content.fraudFeature2Title, description: content.fraudFeature2Desc },
                { icon: <Zap className="w-8 h-8"/>, title: content.fraudFeature3Title, description: content.fraudFeature3Desc },
            ]
        },
        {
            title: content.blockchainTitle,
            headline: content.blockchainHeadline,
            subtitle: content.blockchainSubtitle,
            features: [
                { icon: <ShieldCheck className="w-8 h-8"/>, title: content.blockchainFeature1Title, description: content.blockchainFeature1Desc },
                { icon: <FileText className="w-8 h-8"/>, title: content.blockchainFeature2Title, description: content.blockchainFeature2Desc },
                { icon: <Package2 className="w-8 h-8"/>, title: content.blockchainFeature3Title, description: content.blockchainFeature3Desc },
            ]
        }
    ];

    return (
        <>
            {sections.map(section => (
                 <motion.section 
                    key={section.title}
                    className="py-16 mt-12 bg-background/20"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={sectionVariants}
                >
                    <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                        <motion.div className="text-center max-w-3xl mx-auto" variants={staggeredContainer}>
                            <motion.h2 variants={itemVariants} className="text-sm font-bold uppercase tracking-widest text-primary">{section.title}</motion.h2>
                            <motion.p variants={itemVariants} className="mt-4 text-3xl md:text-4xl font-bold font-headline text-white">{section.headline}</motion.p>
                            <motion.p variants={itemVariants} className="mt-4 text-lg text-muted-foreground">{section.subtitle}</motion.p>
                        </motion.div>
                        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12" variants={staggeredContainer}>
                           {section.features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
                        </motion.div>
                    </div>
                </motion.section>
            ))}
        </>
    )
}

const BulkUploadResult = ({ result, onNewJob }: { result: ProcessBulkDeliveryOutput, onNewJob: (job: any) => void }) => {
    return (
        <Card className="w-full bg-card/80 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500"/> Upload Processed</CardTitle>
                <CardDescription>AI analysis of your bulk delivery file is complete.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold">Upload Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p>Total Packages: <span className="font-bold">{result.uploadSummary.totalPackages}</span></p>
                        <p>Valid Addresses: <span className="font-bold text-green-400">{result.uploadSummary.validPackages}</span></p>
                        <p>Invalid Addresses: <span className="font-bold text-red-400">{result.uploadSummary.invalidPackages}</span></p>
                        <p>Unique Zones: <span className="font-bold">{result.uploadSummary.uniqueZones}</span></p>
                    </div>
                    <Alert>
                        <BarChart className="h-4 w-4" />
                        <AlertTitle>Total Quote: €{result.uploadSummary.totalQuote.toFixed(2)}</AlertTitle>
                    </Alert>
                    <Alert className="bg-primary/10 border-primary/20">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                        <AlertTitle>Smart Pricing</AlertTitle>
                        <AlertDescription>{result.smartPricingSuggestion.reason} Dispatch between <span className="font-bold">{result.smartPricingSuggestion.window}</span> to save ~{result.smartPricingSuggestion.savingsPercentage}%.</AlertDescription>
                    </Alert>
                     <Alert className="bg-accent/10 border-accent/20">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <AlertTitle>Demand Forecast ({result.demandForecast.confidence})</AlertTitle>
                        <AlertDescription>{result.demandForecast.prediction}</AlertDescription>
                    </Alert>
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold">Consolidated Routes</h3>
                    <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/50">
                        <div className="space-y-4">
                        {result.consolidatedRoutes.map(route => (
                            <div key={route.zone}>
                                <h4 className="font-semibold flex items-center gap-2">{route.zone} <Badge variant="secondary">{route.addresses.length} drops</Badge></h4>
                                <p className="text-xs text-muted-foreground italic mt-1">"{route.routeSuggestion}"</p>
                                <ul className="text-xs list-disc pl-5 mt-2 space-y-1">
                                    {route.addresses.map(addr => <li key={addr} className="truncate">{addr}</li>)}
                                </ul>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}


const GetStartedSection = () => {
    const { content } = useLanguage();
    const { toast } = useToast();
    const { addJobs } = useJobs();
    const [quote, setQuote] = useState<GetQuoteOutput | null>(null);
    const [insuranceQuote, setInsuranceQuote] = useState<GetInsuranceQuoteOutput | null>(null);
    const [isGettingQuote, setIsGettingQuote] = useState(false);
    const [addresses, setAddresses] = useState<{ pickup: string | null; destinations: string[] }>({ pickup: null, destinations: [] });
    const isReviewed = quote !== null;

    // State for bulk upload
    const fileInputRef = useMemo(() => React.createRef<HTMLInputElement>(), []);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<ProcessBulkDeliveryOutput | null>(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadResult(null);

        Papa.parse<string[]>(file, {
            header: false,
            skipEmptyLines: true,
            complete: async (results) => {
                const csvString = Papa.unparse(results.data);
                
                // Simulate processing time
                const interval = setInterval(() => {
                    setUploadProgress(prev => Math.min(prev + 10, 90));
                }, 200);

                const result = await handleProcessBulkDelivery({ csvData: csvString });
                clearInterval(interval);
                setUploadProgress(100);

                if (result.success && result.data) {
                    setUploadResult(result.data);
                    
                    // Create mock jobs from the bulk upload
                    const newJobs = result.data.consolidatedRoutes.flatMap(route => 
                        route.addresses.map((addr, i) => ({
                            id: `bulk-${route.zone}-${i}-${Date.now()}`,
                            pickup: 'Central Warehouse',
                            dropoff: addr,
                            distance: `${(Math.random() * 10 + 2).toFixed(1)} km`,
                            payout: `${(Math.random() * 10 + 8).toFixed(2)}`,
                            time: `${Math.floor(Math.random() * 20 + 15)} min`,
                            suggestion: "Bulk order dispatch. High efficiency.",
                            suggestionType: 'accept' as const
                        }))
                    );
                    addJobs(newJobs);
                    toast({ title: 'Bulk Upload Successful!', description: `${newJobs.length} new jobs have been created.` });

                } else {
                    toast({ variant: 'destructive', title: 'Upload Failed', description: result.error });
                }
                
                setTimeout(() => setIsUploading(false), 1000);
            },
            error: (error) => {
                console.error('CSV parsing error:', error);
                toast({ variant: 'destructive', title: 'File Error', description: 'Could not parse the CSV file.' });
                setIsUploading(false);
            },
        });
    };
    
    return (
        <motion.section 
            id="get-started"
            className="py-16 mt-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={sectionVariants}
        >
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">{content.getStartedTitle}</h2>
                    <p className="mt-4 text-3xl md:text-4xl font-bold font-headline text-white">{content.getStartedSubtitle}</p>
                </div>
                 <div className="mt-12 grid lg:grid-cols-2 gap-8 items-start">
                    <DeliveryForm
                        onAddressChange={setAddresses}
                        onQuoteChange={setQuote}
                        onInsuranceChange={setInsuranceQuote}
                        quote={quote}
                        insuranceQuote={insuranceQuote}
                        isReviewed={isReviewed}
                        isGettingQuote={isGettingQuote}
                        setIsGettingQuote={setIsGettingQuote}
                    />

                    <div className="flex flex-col gap-8">
                        {isReviewed ? (
                             <Card className="w-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
                                 <CardHeader>
                                     <CardTitle className="font-headline text-3xl flex items-center gap-2"><Bot className="w-7 h-7 text-primary" />AI Quote & Analysis</CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="p-4 rounded-lg bg-muted text-center"><p className="text-sm text-muted-foreground">Price</p><p className="text-4xl font-bold text-white">€{((quote?.price || 0) + (insuranceQuote?.premium || 0)).toFixed(2)}</p></div>
                                         <div className="p-4 rounded-lg bg-muted text-center"><p className="text-sm text-muted-foreground">ETA</p><p className="text-4xl font-bold text-white">{quote?.eta}</p></div>
                                     </div>
                                      {insuranceQuote && (
                                        <Alert className="bg-green-500/10 border-green-500/20">
                                            <ShieldCheck className="h-4 w-4 text-green-500"/>
                                            <AlertTitle>Delivery Insured</AlertTitle>
                                            <AlertDescription>
                                                Covered for €{insuranceQuote.coverageAmount.toFixed(2)}. <span className="text-xs">{insuranceQuote.riskAnalysis}</span>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                     <Alert>
                                        <Truck className="h-4 w-4" />
                                        <AlertTitle>Route Details</AlertTitle>
                                        <AlertDescription>
                                            <p>{quote?.distance} | {quote?.co2Emission} of CO₂e</p>
                                            <p className="text-xs">ETA Confidence: {quote?.etaConfidencePercentage}% ({quote?.etaConfidenceRange})</p>
                                        </AlertDescription>
                                    </Alert>
                                 </CardContent>
                             </Card>
                        ) : (
                           <LiveTrackingPreview pickupAddress={addresses.pickup} destinationAddresses={addresses.destinations} />
                        )}
                        <Card className="w-full bg-card/80 border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Briefcase/>B2B Bulk Upload</CardTitle>
                                <CardDescription>Have multiple deliveries? Upload a CSV with `destination_address`, `package_weight_kg`, and `notes` columns.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isUploading ? (
                                    <Progress value={uploadProgress} />
                                ) : uploadResult ? (
                                    <BulkUploadResult result={uploadResult} onNewJob={() => {}}/>
                                ) : (
                                    <Button onClick={handleFileSelect} variant="outline" className="w-full">
                                        <UploadCloud className="mr-2"/>Upload CSV File
                                    </Button>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden"/>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

// --- Main Page Component ---

export default function HomePage() {
  return (
    <MainLayout>
        <div className="w-full pt-24 md:pt-48">
            <HeroSection />
            <FeaturesSection />
            <GetStartedSection />
        </div>
        <FloatingSupportButton />
    </MainLayout>
  );
}
