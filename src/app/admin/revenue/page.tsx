
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Bar, LineChart, Line, CartesianGrid } from "recharts";
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-background/80 border rounded-lg shadow-lg">
                <p className="font-bold">{label}</p>
                <p className="text-sm text-primary">{`Revenue : €${payload[0].value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

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
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8, fill: 'hsl(var(--primary))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart/> Revenue by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                           <RechartsBarChart data={revenueByType} layout="vertical" margin={{ left: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                           </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
