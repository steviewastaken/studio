
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, DollarSign, Package, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Bar, LineChart, Line, CartesianGrid } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for a sample B2B client
const b2bData = {
  totalSpend: 45231.50,
  totalDeliveries: 1890,
  avgCost: 23.93,
  monthlySpend: [
    { month: 'Jan', spend: 6500 },
    { month: 'Feb', spend: 5800 },
    { month: 'Mar', spend: 7200 },
    { month: 'Apr', spend: 8100 },
    { month: 'May', spend: 8500 },
    { month: 'Jun', spend: 9131.50 },
  ],
  topZones: [
    { zone: 'La Défense', deliveries: 650 },
    { zone: 'Le Marais', deliveries: 420 },
    { zone: 'Opéra', deliveries: 310 },
    { zone: 'Saint-Germain', deliveries: 250 },
    { zone: 'Bercy', deliveries: 110 },
  ],
  recentDeliveries: [
    { id: 'B2B-D001', destination: 'La Défense', cost: 22.50, status: 'Delivered' },
    { id: 'B2B-D002', destination: 'Le Marais', cost: 18.00, status: 'Delivered' },
    { id: 'B2B-D003', destination: 'Opéra Garnier', cost: 15.75, status: 'In Transit' },
    { id: 'B2B-D004', destination: 'La Défense', cost: 25.00, status: 'Delivered' },
    { id: 'B2B-D005', destination: 'Le Marais', cost: 19.50, status: 'Failed' },
  ]
};

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-background/80 border rounded-lg shadow-lg">
                <p className="font-bold">{label}</p>
                <p className="text-sm text-primary">{formatter(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'In Transit': return <Badge className="bg-blue-600">In Transit</Badge>;
        case 'Delivered': return <Badge className="bg-green-600">Delivered</Badge>;
        case 'Failed': return <Badge variant="destructive">Failed</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
}

export default function B2BAnalyticsPage() {
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
                <h1 className="text-4xl font-bold font-headline text-white flex items-center gap-3"><Briefcase/> B2B Analytics Dashboard</h1>
                <p className="mt-1 text-lg text-muted-foreground">Performance and spending insights for enterprise clients.</p>
            </motion.div>
            
            <div className="mt-8 grid gap-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <Card className="bg-card/80 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">€{b2bData.totalSpend.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">Lifetime enterprise spending</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{b2bData.totalDeliveries.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+15% from last month</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/80 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Cost/Delivery</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">€{b2bData.avgCost.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Stable over last 3 months</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card className="lg:col-span-3 bg-card/80 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><TrendingUp/> Spend Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={b2bData.monthlySpend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                    <Tooltip content={<CustomTooltip formatter={(value: number) => `€${value.toLocaleString()}`} />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                                    <Line type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2 bg-card/80 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MapPin/> Top Delivery Zones</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={b2bData.topZones} layout="vertical" margin={{ left: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="zone" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                                    <Tooltip content={<CustomTooltip formatter={(value: number) => `${value.toLocaleString()} deliveries`} />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                                    <Bar dataKey="deliveries" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Recent Deliveries Table */}
                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle>Recent B2B Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tracking ID</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {b2bData.recentDeliveries.map(delivery => (
                                    <TableRow key={delivery.id}>
                                        <TableCell className="font-mono text-xs">{delivery.id}</TableCell>
                                        <TableCell>{delivery.destination}</TableCell>
                                        <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                                        <TableCell className="text-right font-medium">€{delivery.cost.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
