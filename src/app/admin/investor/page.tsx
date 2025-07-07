
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Loader2, AlertTriangle, TrendingUp, Users, UserMinus, Repeat, Sparkles, BarChart2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { handleGetInvestorReport } from '@/lib/actions';
import type { GetInvestorReportOutput } from '@/ai/flows/get-investor-report';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from '@/components/ui/skeleton';

const userGrowthData = [
  { month: 'Jan', users: 400 },
  { month: 'Feb', users: 620 },
  { month: 'Mar', users: 980 },
  { month: 'Apr', users: 1530 },
  { month: 'May', users: 2450 },
  { month: 'Jun', users: 3890 },
];

const mockInvestorData = {
  cac: 25.50,
  ltv: 180.75,
  viralCoefficient: 0.15,
  monthlyChurn: 4.2,
};

const chartConfig = {
  users: {
    label: "New Users",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function InvestorPage() {
    const [report, setReport] = useState<GetInvestorReportOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            const result = await handleGetInvestorReport({
                ...mockInvestorData,
                userGrowth: userGrowthData
            });
            if (result.success && result.data) {
                setReport(result.data);
            } else {
                setError(result.error || "Failed to fetch AI summary.");
            }
            setIsLoading(false);
        };
        fetchReport();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/admin"><ArrowLeft className="mr-2" /> Back to Dashboard</Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white flex items-center gap-3"><TrendingUp/> Investor Dashboard</h1>
                <p className="mt-1 text-lg text-muted-foreground">Key growth, profitability, and retention metrics.</p>
            </motion.div>

            <div className="mt-8 grid gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-white/10">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-accent"/> AI-Powered Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <Skeleton className="h-16 w-full" />}
                        {error && <p className="text-destructive">{error}</p>}
                        {report && <p className="text-muted-foreground italic">{report.summary}</p>}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card/80 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users /> User Growth</CardTitle>
                            <CardDescription>Total users over the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="w-full h-[250px]">
                                <AreaChart accessibilityLayer data={userGrowthData} margin={{left: 12, right: 12}}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)}/>
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <defs>
                                        <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area dataKey="users" type="natural" fill="url(#fillUsers)" stroke="var(--color-users)" stackId="a" />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/80 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart2 /> Key Financials</CardTitle>
                            <CardDescription>Core profitability metrics for the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-6">
                            <div className="p-4 rounded-lg bg-muted text-center">
                                <h3 className="text-sm font-medium text-muted-foreground">Customer Acquisition Cost (CAC)</h3>
                                <p className="text-4xl font-bold text-white mt-2">€{mockInvestorData.cac.toFixed(2)}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted text-center">
                                <h3 className="text-sm font-medium text-muted-foreground">Lifetime Value (LTV)</h3>
                                <p className="text-4xl font-bold text-green-400 mt-2">€{mockInvestorData.ltv.toFixed(2)}</p>
                            </div>
                            <div className="col-span-2 p-4 rounded-lg bg-muted text-center">
                                <h3 className="text-sm font-medium text-muted-foreground">LTV to CAC Ratio</h3>
                                <p className="text-4xl font-bold text-white mt-2">{(mockInvestorData.ltv / mockInvestorData.cac).toFixed(2)}x</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card/80 border-white/10">
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><Repeat /> Virality</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-5xl font-bold text-white">{mockInvestorData.viralCoefficient.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground mt-2">New users per existing user</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/80 border-white/10">
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><UserMinus /> Monthly Churn</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                             <p className="text-5xl font-bold text-white">{mockInvestorData.monthlyChurn.toFixed(1)}%</p>
                             <p className="text-sm text-muted-foreground mt-2">Users lost per month</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/80 border-white/10">
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><BrainCircuit /> AI Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading && <Skeleton className="h-10 w-full" />}
                            {error && <p className="text-destructive text-sm">{error}</p>}
                            {report && <p className="text-muted-foreground text-sm">{report.keyInsight}</p>}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}
