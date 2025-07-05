
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BarChart, Users, Euro, ShieldCheck, Server, Activity, CheckCircle, AlertTriangle, UserPlus, Headset, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const LoadingSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-80 mb-12" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
             <Skeleton className="h-96 rounded-lg" />
             <Skeleton className="h-96 rounded-lg" />
        </div>
    </div>
);

const AccessDenied = () => {
    const router = useRouter();
    return (
        <div className="w-full h-screen flex items-center justify-center">
             <Card className="p-8 text-center bg-card/80 border-white/10">
                 <CardTitle className="font-headline text-3xl">Access Denied</CardTitle>
                 <CardDescription className="mt-2">You do not have permission to view this page.</CardDescription>
                 <Button onClick={() => router.push('/signin?redirect=/admin')} className="mt-6">
                    Sign In as Admin
                 </Button>
             </Card>
        </div>
    )
}


const recentActivities = [
  { icon: <UserPlus className="text-green-500" />, text: "New courier 'Speedy Gonzalez' just signed up.", time: "2m ago" },
  { icon: <CheckCircle className="text-primary" />, text: "Delivery #DNLVR-789 successfully completed.", time: "5m ago" },
  { icon: <AlertTriangle className="text-yellow-500" />, text: "Fraud alert triggered for transaction #FT-9912.", time: "8m ago" },
  { icon: <Headset className="text-blue-500" />, text: "Support AI escalated chat #chat-2 to human review.", time: "12m ago" },
  { icon: <Euro className="text-green-500" />, text: "High-value delivery of €550 scheduled.", time: "15m ago" },
];

const RecentActivityFeed = () => (
    <Card className="bg-card/80 border-white/10">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity /> Recent Activity</CardTitle>
            <CardDescription>A live feed of important platform events.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-full mt-1">
                            {activity.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm">{activity.text}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const SystemHealthPanel = () => (
    <Card className="bg-card/80 border-white/10">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server /> System Health</CardTitle>
            <CardDescription>Real-time status of our core services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium">API Response Time</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-green-400">45ms</p>
                    <Badge variant="outline" className="border-green-500/50 text-green-400">Excellent</Badge>
                </div>
            </div>
             <div className="space-y-1">
                 <div className="flex justify-between items-center text-sm">
                    <p>AI Model Requests</p>
                    <p>8,231/10,000 processed</p>
                 </div>
                 <Progress value={82} className="h-2"/>
             </div>
             <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Database Connections</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">12/100</p>
                    <Badge variant="outline" className="border-green-500/50 text-green-400">Healthy</Badge>
                </div>
            </div>
             <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Background Jobs</p>
                <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm text-green-400">Processing</p>
                </div>
            </div>
        </CardContent>
    </Card>
);


export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user?.role !== 'admin') {
            router.push('/signin?redirect=/admin');
        }
    }, [loading, user, router]);

    if (loading || !user) {
        return <LoadingSkeleton />;
    }

    if (user.role !== 'admin') {
        return <AccessDenied />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold font-headline text-white">Admin Dashboard</h1>
                <p className="mt-1 text-lg text-muted-foreground">Overview of the Dunlivrer platform.</p>
            </motion.div>
            
             <motion.div
                className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2, staggerChildren: 0.1 } }}
            >
                <Link href="/admin/revenue">
                    <Card className="bg-card/80 border-white/10 hover:border-primary/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <Euro className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">€45,231.89</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/admin/couriers">
                    <Card className="bg-card/80 border-white/10 hover:border-primary/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Couriers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+235</div>
                            <p className="text-xs text-muted-foreground">+18 from last week</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/admin/deliveries">
                    <Card className="bg-card/80 border-white/10 hover:border-primary/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Deliveries Today</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+1,234</div>
                            <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/admin/fraud-alerts">
                    <Card className="bg-card/80 border-white/10 hover:border-primary/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">Awaiting manual review</p>
                        </CardContent>
                    </Card>
                 </Link>
                 <Link href="/admin/support">
                    <Card className="bg-card/80 border-white/10 hover:border-primary/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Live Support</CardTitle>
                            <Headset className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Chat requires attention</p>
                        </CardContent>
                    </Card>
                 </Link>
                 <Link href="/admin/forecasting">
                    <Card className="bg-card/80 border-white/10 hover:border-primary/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Demand Forecast</CardTitle>
                            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3 High Zones</div>
                            <p className="text-xs text-muted-foreground">Next hour prediction</p>
                        </CardContent>
                    </Card>
                </Link>
            </motion.div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
                 <RecentActivityFeed />
                 <SystemHealthPanel />
            </div>
        </div>
    );
}
