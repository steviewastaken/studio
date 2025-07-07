
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { motion } from "framer-motion";

const monthlyRevenue = [
  { name: 'Jan', revenue: 25000 },
  { name: 'Feb', revenue: 28000 },
  { name: 'Mar', revenue: 32000 },
  { name: 'Apr', revenue: 30000 },
  { name: 'May', revenue: 35000 },
  { name: 'Jun', revenue: 45231 },
];

const revenueByType = [
  { name: 'Standard', value: 25231 },
  { name: 'Express', value: 15000 },
  { name: 'Night', value: 5000 },
];

const chartConfig = {
  revenue: {
    label: "Revenue (€)",
    color: "hsl(var(--chart-1))",
  },
  value: {
    label: "Revenue (€)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function RevenuePage() {
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
                <h1 className="text-4xl font-bold font-headline text-white">Revenue Analytics</h1>
                <p className="mt-1 text-lg text-muted-foreground">Detailed breakdown of financial performance.</p>
            </motion.div>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-2 bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp/> Monthly Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full h-[300px]">
                            <LineChart accessibilityLayer data={monthlyRevenue} margin={{left: 12, right: 12}}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false}/>
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart/> Revenue by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full h-[300px]">
                           <RechartsBarChart accessibilityLayer data={revenueByType} layout="vertical" margin={{ left: 10 }}>
                                <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} />
                                <XAxis type="number" hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="value" layout="vertical" fill="var(--color-value)" radius={4} />
                           </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
