
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, Users, TrendingUp, Bot, Ship, Briefcase, BrainCircuit, BarChart, Package, FileText, Check, AlertTriangle, Loader2 } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';
import DeliveryForm from "@/components/dunlivrer/delivery-form";
import LiveTrackingPreview from "@/components/dunlivrer/live-tracking-preview";
import { useState } from "react";
import FloatingSupportButton from "@/components/dunlivrer/floating-support-button";
import type { GetQuoteOutput } from "@/ai/flows/get-quote";
import type { GetInsuranceQuoteOutput } from "@/ai/flows/get-insurance-quote";
import { useLanguage } from "@/context/language-context";
import Papa from 'papaparse';
import { useToast } from "@/hooks/use-toast";
import { handleProcessBulkDelivery } from "@/lib/actions";
import { Progress } from "@/components/ui/progress";
import type { ProcessBulkDeliveryOutput } from "@/ai/flows/process-bulk-delivery";
import { useJobs } from "@/context/jobs-context";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
};


const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-card/50 border border-white/10 shadow-lg flex flex-col items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-lg text-primary">{icon}</div>
        <h3 className="text-xl font-bold font-headline text-white">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </motion.div>
);

const BulkUploadResults = ({ results, onReset }: { results: ProcessBulkDeliveryOutput, onReset: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="bg-card/80 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Check /> Upload Processed</CardTitle>
                <CardDescription>Your bulk delivery file has been analyzed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{results.uploadSummary.totalPackages}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Valid</p>
                        <p className="text-lg font-bold text-green-400">{results.uploadSummary.validPackages}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Invalid</p>
                        <p className="text-lg font-bold text-red-400">{results.uploadSummary.invalidPackages}</p>
                    </div>
                     <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Total Quote</p>
                        <p className="text-lg font-bold">€{results.uploadSummary.totalQuote.toFixed(2)}</p>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-white mb-2">Smart Pricing Suggestion</h4>
                    <Alert className="bg-primary/10 border-primary/20">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <AlertTitle>Optimal Window: {results.smartPricingSuggestion.window}</AlertTitle>
                        <AlertDescription>
                            Dispatch during this time for ~{results.smartPricingSuggestion.savingsPercentage}% savings due to {results.smartPricingSuggestion.reason}.
                        </AlertDescription>
                    </Alert>
                </div>
                <div>
                     <Button onClick={onReset} className="w-full">Upload Another File</Button>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);


const BulkUpload = () => {
    const { toast } = useToast();
    const { addJobs } = useJobs();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [results, setResults] = useState<ProcessBulkDeliveryOutput | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setResults(null);
        
        // Simulate reading progress
        const reader = new FileReader();
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentLoaded = Math.round((event.loaded / event.total) * 50); // Reading is first 50%
                setUploadProgress(percentLoaded);
            }
        };

        reader.onload = async (e) => {
            const csvData = e.target?.result as string;

            // Simulate processing progress
            setUploadProgress(75);

            const result = await handleProcessBulkDelivery({ csvData });

            if (result.success && result.data) {
                setResults(result.data);
                const newJobs = result.data.consolidatedRoutes.flatMap(route => 
                    route.addresses.map(address => ({
                        id: `bulk-${Math.random().toString(36).substring(7)}`,
                        pickup: 'Bulk Dispatch Center',
                        dropoff: address,
                        distance: 'N/A',
                        payout: 'N/A',
                        time: 'N/A',
                        suggestion: 'Part of a consolidated bulk delivery.',
                        suggestionType: 'neutral' as const
                    }))
                );
                addJobs(newJobs);
                toast({ title: "Bulk Upload Processed!", description: "AI analysis complete. Check driver app for jobs." });
            } else {
                toast({ variant: "destructive", title: "Processing Failed", description: result.error });
                setIsUploading(false);
            }
            setUploadProgress(100);
        };
        
        reader.onerror = () => {
             toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
             setIsUploading(false);
        }

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const csvString = Papa.unparse(results.data);
                const result = await handleProcessBulkDelivery({ csvData: csvString });
                 if (result.success && result.data) {
                    setResults(result.data);
                    toast({ title: "Bulk Upload Processed!", description: "AI analysis complete." });
                } else {
                    toast({ variant: "destructive", title: "Processing Failed", description: result.error });
                }
                setIsUploading(false);
            },
            error: (error: any) => {
                toast({ variant: "destructive", title: "Parsing Error", description: error.message });
                setIsUploading(false);
            }
        });
    };

    if (results) {
        return <BulkUploadResults results={results} onReset={() => setResults(null)} />;
    }

    return (
        <Card className="bg-card/80 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package/> Bulk Delivery Upload</CardTitle>
                <CardDescription>Upload a CSV file of deliveries for AI-powered processing and optimization.</CardDescription>
            </CardHeader>
            <CardContent>
                {isUploading ? (
                    <div className="space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-center text-muted-foreground">Processing your file...</p>
                    </div>
                ) : (
                    <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".csv" onChange={handleFileUpload} />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="w-8 h-8"/>
                            <p className="font-semibold text-white">Click or drag to upload a CSV file</p>
                            <p className="text-xs">Required columns: `destination_address`, `package_weight_kg`, `notes`</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}



export default function HomePage() {
  const { content } = useLanguage();
  const [addresses, setAddresses] = useState<{ pickup: string | null; destinations: string[] }>({ pickup: null, destinations: [] });
  const [quote, setQuote] = useState<GetQuoteOutput | null>(null);
  const [insuranceQuote, setInsuranceQuote] = useState<GetInsuranceQuoteOutput | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const isReviewed = !!quote;
  
  const totalCost = (quote?.price || 0) + (insuranceQuote?.premium || 0);

  return (
    <>
      <div className="w-full overflow-hidden">
          <motion.section 
              className="w-full pt-32 pb-16 md:pt-48 md:pb-24 text-center relative"
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
          >
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-transparent to-transparent"></div>
              <div className="max-w-4xl mx-auto px-4">
                  <motion.h1 
                    variants={itemVariants} 
                    className="text-4xl md:text-6xl font-bold font-headline text-white whitespace-pre-line"
                  >
                    {content.heroTitle}
                  </motion.h1>
                  <motion.p 
                    variants={itemVariants} 
                    className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground"
                  >
                    {content.heroSubtitle}
                  </motion.p>
                  <motion.div 
                    variants={itemVariants}
                    className="mt-8 flex justify-center gap-4"
                  >
                      <Button size="lg" asChild>
                          <Link href="#get-started">{content.scheduleButton}</Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                          <Link href="/contact">{content.contactButton}</Link>
                      </Button>
                  </motion.div>
              </div>
          </motion.section>

          <section id="get-started" className="py-16 scroll-mt-24">
              <div className="max-w-7xl w-full mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                  <div className="lg:col-span-2">
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
                  </div>
                  <div className="lg:col-span-3">
                      <div className="sticky top-24">
                          <LiveTrackingPreview 
                              pickupAddress={addresses.pickup}
                              destinationAddresses={addresses.destinations}
                          />
                           {isReviewed && quote && (
                              <motion.div 
                                  className="mt-4"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                              >
                                  <Card className="bg-card/80 border-white/10 shadow-lg">
                                      <CardHeader>
                                          <CardTitle className="flex items-center justify-between">
                                              AI Generated Quote
                                              <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="gap-1.5"><Check className="text-green-400"/> {quote.etaConfidencePercentage}%</Badge>
                                                <Badge variant="destructive">{quote.etaConfidenceRange}</Badge>
                                              </div>
                                          </CardTitle>
                                      </CardHeader>
                                      <CardContent className="grid grid-cols-3 gap-4 text-center">
                                          <div className="p-3 bg-muted rounded-md">
                                              <p className="text-xs text-muted-foreground">Distance</p>
                                              <p className="text-lg font-bold">{quote.distance}</p>
                                          </div>
                                          <div className="p-3 bg-muted rounded-md">
                                              <p className="text-xs text-muted-foreground">Est. Time</p>
                                              <p className="text-lg font-bold">{quote.eta}</p>
                                          </div>
                                          <div className="p-3 bg-muted rounded-md">
                                              <p className="text-xs text-muted-foreground">CO2 Emission</p>
                                              <p className="text-lg font-bold">{quote.co2Emission}</p>
                                          </div>
                                      </CardContent>
                                      <CardContent>
                                        <Card className="bg-muted border-none">
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-white text-lg">Total Cost</p>
                                                    {insuranceQuote && (
                                                        <p className="text-xs text-muted-foreground">
                                                            €{quote.price.toFixed(2)} (Delivery) + €{insuranceQuote.premium.toFixed(2)} (Insurance)
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-4xl font-bold font-headline text-primary">€{totalCost.toFixed(2)}</p>
                                            </CardContent>
                                        </Card>
                                      </CardContent>
                                  </Card>
                              </motion.div>
                          )}
                      </div>
                  </div>
              </div>
          </section>
          
          <section id="bulk-upload" className="py-16 scroll-mt-24">
              <div className="max-w-2xl w-full mx-auto px-4 md:px-8">
                <BulkUpload />
              </div>
          </section>

           <motion.section 
              className="py-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionVariants}
            >
              <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary">{content.solutionsTitle}</h2>
                  <p className="mt-4 text-3xl md:text-4xl font-bold font-headline text-white">{content.solutionsHeadline}</p>
              </div>
              <div className="max-w-7xl mx-auto mt-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={<Ship className="w-8 h-8"/>} 
                    title={content.service1Title} 
                    description={content.service1Desc} 
                  />
                  <FeatureCard 
                    icon={<Briefcase className="w-8 h-8"/>} 
                    title={content.service2Title} 
                    description={content.service2Desc} 
                  />
                  <FeatureCard 
                    icon={<BrainCircuit className="w-8 h-8"/>} 
                    title={content.service3Title} 
                    description={content.service3Desc} 
                  />
              </div>
          </motion.section>

      </div>
      <FloatingSupportButton />
    </>
  );
}
