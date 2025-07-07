
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Lightbulb, BarChart, Clock, AlertCircle } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { handleGetDriverPerformanceReport } from "@/lib/actions";
import type { GetDriverPerformanceReportOutput } from "@/ai/flows/get-driver-performance-report";
import { useAuth } from "@/context/auth-context";

// Mock data for demonstration purposes
const mockDeliveryHistory = [
  { deliveryId: 'd1', zone: 'Le Marais', estimatedMinutes: 25, actualMinutes: 28 },
  { deliveryId: 'd2', zone: 'Montmartre', estimatedMinutes: 20, actualMinutes: 19 },
  { deliveryId: 'd3', zone: 'Le Marais', estimatedMinutes: 30, actualMinutes: 35 },
  { deliveryId: 'd4', zone: 'Saint-Germain', estimatedMinutes: 15, actualMinutes: 16 },
  { deliveryId: 'd5', zone: 'Montmartre', estimatedMinutes: 22, actualMinutes: 24 },
  { deliveryId: 'd6', zone: 'Le Marais', estimatedMinutes: 28, actualMinutes: 27 },
];
const mockCityAverage = 24;

const chartConfig = {
  time: {
    label: "Time (min)",
    color: "hsl(var(--chart-1))",
  },
  yourTime: {
    label: "Your Time",
    color: "hsl(var(--chart-1))",
  },
  averageTime: {
    label: "City Average",
    color: "hsl(var(--chart-2))",
  }
} satisfies ChartConfig

export default function PerformanceDashboard({ isActive }: { isActive: boolean }) {
  const { user } = useAuth();
  const [report, setReport] = useState<GetDriverPerformanceReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);

      const result = await handleGetDriverPerformanceReport({
        driverId: user.id,
        deliveryHistory: mockDeliveryHistory,
        cityAverageDeliveryMinutes: mockCityAverage,
      });

      if (result.success && result.data) {
        setReport(result.data);
      } else {
        setError(result.error || "An unknown error occurred.");
      }
      setIsLoading(false);
      setHasFetched(true);
    };
    
    if (isActive && !hasFetched) {
        fetchReport();
    }
  }, [user, isActive, hasFetched]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 font-semibold">Generating Your Performance Report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center p-12 bg-destructive/10 border-destructive/50">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
        <CardTitle className="font-headline text-2xl mt-4">Report Failed</CardTitle>
        <CardDescription className="mt-2">{error}</CardDescription>
      </Card>
    );
  }
  
  if (!report) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
            <BarChart className="w-10 h-10 mb-4"/>
            <p className="font-semibold">Performance data is loaded when you open this tab.</p>
            <p className="text-sm">This prevents slowing down the app.</p>
        </div>
      );
  }

  const comparisonData = [
    { name: "Your Average", time: report.driverAverageTime, fill: "var(--color-yourTime)" },
    { name: "Courier Average", time: mockCityAverage, fill: "var(--color-averageTime)" }
  ];

  const zoneData = report.timePerZone;

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Avg. Time</CardTitle>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{report.driverAverageTime.toFixed(1)} min</div>
                    <p className="text-xs text-muted-foreground">
                        {report.driverAverageTime > mockCityAverage ? "Slower" : "Faster"} than city average of {mockCityAverage} min
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Late Deliveries</CardTitle>
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{report.missedOrLateDeliveries}</div>
                    <p className="text-xs text-muted-foreground">
                        Deliveries that exceeded ETA
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5"/>Time Comparison</CardTitle>
                    <CardDescription>Your average delivery time vs. all couriers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="w-full h-[250px]">
                        <RechartsBarChart accessibilityLayer data={comparisonData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={100} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="time" radius={[0, 4, 4, 0]} barSize={35} />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="bg-card/80 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5"/>Time per Zone</CardTitle>
                    <CardDescription>Your average time in different city zones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="w-full h-[250px]">
                         <RechartsBarChart accessibilityLayer data={zoneData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="zone" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="averageTime" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" nameKey="averageTime" />} />
                            <Bar dataKey="averageTime" name="Time" fill="var(--color-time)" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3"><Lightbulb className="text-primary"/>AI-Powered Coaching</CardTitle>
                <CardDescription>Here are some personalized suggestions to help you optimize your routes and earnings.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {report.aiSuggestions.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="p-1.5 bg-primary/20 rounded-full mt-1"><Lightbulb className="w-4 h-4 text-primary"/></div>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
