
"use client"

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Loader2, AlertTriangle, Upload, FileText, Download, Briefcase, BarChart, File, Lightbulb, Zap, Route } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { handleProcessBulkDelivery } from '@/lib/actions';
import type { ProcessBulkDeliveryOutput } from '@/ai/flows/process-bulk-delivery';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

const sampleCsvData = `destination_address,package_size,notes
"Eiffel Tower, Paris, France",medium,"VIP delivery"
"Louvre Museum, Paris, France",small,"Fragile item"
"5 Rue de Rivoli, 75004 Paris",small,""
"Arc de Triomphe, Paris",large,"Requires 2 people"
"221B Baker Street, London",medium,"Address outside primary zone"
"Montmartre, Paris, France",medium,"Weekly restock for cafe"
"La Défense, Puteaux",small,"Office documents"
"Montmartre, Paris, France",small,"Second package for cafe"`;

const B2BUploader = ({ onProcess }: { onProcess: (csv: string) => void }) => {
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
                // The parent component will set its own loading state
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

    return (
        <Card className="bg-card/80 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload/> Bulk Delivery Uploader</CardTitle>
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
                <div className="flex items-center gap-4">
                     <Button onClick={handleProcess} disabled={!file || isProcessing} className="w-full">
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <BrainCircuit className="mr-2"/>}
                        {isProcessing ? "Parsing..." : "Generate AI Dispatch Plan"}
                    </Button>
                    <Button onClick={handleDownloadTemplate} variant="outline">
                        <Download className="mr-2" /> Template
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ResultsDisplay = ({ result }: { result: ProcessBulkDeliveryOutput }) => {
    return (
        <div className="mt-8 space-y-8">
            {/* AI Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Route Consolidation */}
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
            </Card>
        </div>
    )
};


export default function B2BPage() {
    const [analysisResult, setAnalysisResult] = useState<ProcessBulkDeliveryOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleProcessCSV = useCallback(async (csvData: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const result = await handleProcessBulkDelivery({ csvData });
        if (result.success && result.data) {
            setAnalysisResult(result.data);
            toast({ title: "Dispatch Plan Generated!", description: "Review the AI-powered suggestions below."});
        } else {
            setError(result.error || "Failed to process the CSV file.");
        }
        setIsLoading(false);
    }, [toast]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white flex items-center gap-3"><Briefcase/> B2B & Enterprise Suite</h1>
                <p className="mt-1 text-lg text-muted-foreground">Advanced tools for our business clients.</p>
            </motion.div>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                    <B2BUploader onProcess={handleProcessCSV} />
                </div>
            </div>

            <AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-12 space-y-4">
                        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                        <h3 className="font-semibold text-xl">AI Engine is processing your manifest...</h3>
                        <p className="text-muted-foreground">Consolidating routes, calculating smart pricing, and forecasting demand.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <Card className="mt-8 bg-destructive/10 border-destructive/30 p-8 text-center text-destructive">
                     <AlertTriangle className="w-12 h-12 mx-auto" />
                     <h2 className="mt-4 text-2xl font-bold">Analysis Failed</h2>
                     <p>{error}</p>
                </Card>
             )}

            {analysisResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <ResultsDisplay result={analysisResult} />
                </motion.div>
            )}

            {/* Placeholder sections */}
            <div className="mt-16 border-t border-dashed border-white/20 pt-10">
                 <h2 className="text-2xl font-bold font-headline text-center text-white">More Enterprise Tools Coming Soon</h2>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card/50 border-white/10 border-dashed text-center p-8">
                        <BarChart className="w-10 h-10 mx-auto text-muted-foreground"/>
                        <h3 className="font-semibold mt-4">Analytics Dashboard</h3>
                        <p className="text-xs text-muted-foreground">Visualize your spending and delivery performance.</p>
                    </Card>
                     <Card className="bg-card/50 border-white/10 border-dashed text-center p-8">
                        <File className="w-10 h-10 mx-auto text-muted-foreground"/>
                        <h3 className="font-semibold mt-4">Invoicing & Billing</h3>
                        <p className="text-xs text-muted-foreground">View and manage your monthly invoices.</p>
                    </Card>
                     <Card className="bg-card/50 border-white/10 border-dashed text-center p-8">
                        <BrainCircuit className="w-10 h-10 mx-auto text-muted-foreground"/>
                        <h3 className="font-semibold mt-4">API & Integrations</h3>
                        <p className="text-xs text-muted-foreground">Connect Dunlivrer to your own systems.</p>
                    </Card>
                 </div>
            </div>
        </div>
    );
}
