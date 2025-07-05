"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Loader2, AlertTriangle, ArrowUp, ArrowDown, User, TrendingUp, TrendingDown, Lightbulb, Zap, MapPin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { handleGetDemandForecast } from '@/lib/actions';
import type { GetDemandForecastOutput } from '@/ai/flows/get-demand-forecast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const DemandCard = ({ forecast, index }: { forecast: GetDemandForecastOutput['forecasts'][0], index: number }) => {
    const demandMeta = {
        'Very High': { icon: <TrendingUp className="text-red-500" />, color: 'bg-red-500/10 border-red-500/30 text-red-400' },
        'High': { icon: <ArrowUp className="text-orange-400" />, color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
        'Medium': { icon: <Zap className="text-yellow-400" />, color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
        'Low': { icon: <ArrowDown className="text-blue-400" />, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
        'Underserved': { icon: <TrendingDown className="text-purple-400" />, color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' }
    };

    const meta = demandMeta[forecast.demandLevel];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="bg-card/80 border-white/10 h-full flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2"><MapPin className="text-primary" /> {forecast.zone}</CardTitle>
                            <CardDescription>Predicted Orders: <span className="font-bold text-white">{forecast.predictedOrders}</span></CardDescription>
                        </div>
                        <Badge variant="outline" className={cn("whitespace-nowrap", meta.color)}>
                            {meta.icon}
                            <span className="ml-1">{forecast.demandLevel} Demand</span>
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">AI Analysis</h4>
                        <p className="text-muted-foreground text-sm italic">"{forecast.analysis}"</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><Lightbulb className="text-yellow-400" />Suggestion</h4>
                        <p className="text-muted-foreground text-sm">{forecast.suggestion}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const LoadingState = () => (
    <>
        <Card className="md:col-span-2 lg:col-span-3 bg-card/80 border-white/10 p-6 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[400px]" />
            </div>
        </Card>
        {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-card/80 border-white/10">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-32" />
                             <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-4/5" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </>
);

export default function ForecastingPage() {
    const [forecast, setForecast] = useState<GetDemandForecastOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForecast = async () => {
            setIsLoading(true);
            const result = await handleGetDemandForecast();
            if (result.success && result.data) {
                setForecast(result.data);
            } else {
                setError(result.error || "Failed to fetch demand forecast.");
            }
            setIsLoading(false);
        };
        fetchForecast();
    }, []);

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
                <h1 className="text-4xl font-bold font-headline text-white flex items-center gap-3"><BrainCircuit/> Demand Forecasting</h1>
                <p className="mt-1 text-lg text-muted-foreground">AI-powered predictions for operational strategy.</p>
            </motion.div>
            
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {isLoading && <LoadingState />}
                 {error && (
                    <Card className="md:col-span-2 lg:col-span-3 bg-destructive/10 border-destructive/30 p-8 text-center text-destructive">
                         <AlertTriangle className="w-12 h-12 mx-auto" />
                         <h2 className="mt-4 text-2xl font-bold">Failed to Generate Forecast</h2>
                         <p>{error}</p>
                    </Card>
                 )}

                {forecast && (
                    <>
                        <motion.div
                             className="md:col-span-2 lg:col-span-3"
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                         >
                            <Card className="bg-card/80 border-white/10 p-6 flex items-center gap-4">
                                <Lightbulb className="w-10 h-10 text-yellow-400" />
                                <div>
                                    <h2 className="font-semibold text-white">City-Wide Summary</h2>
                                    <p className="text-muted-foreground">{forecast.overallSummary}</p>
                                </div>
                            </Card>
                        </motion.div>
                        {forecast.forecasts.map((f, i) => <DemandCard key={f.zone} forecast={f} index={i} />)}
                    </>
                )}
            </div>
        </div>
    );
}
