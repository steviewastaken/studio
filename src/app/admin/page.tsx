
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BarChart, Users, Euro, ShieldCheck } from "lucide-react";

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

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!user) {
        // Redirect to signin if not logged in at all
        if (typeof window !== 'undefined') {
            router.push('/signin?redirect=/admin');
        }
        return <LoadingSkeleton />; // Show skeleton while redirecting
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
                className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2, staggerChildren: 0.1 } }}
            >
                <Card className="bg-card/80 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Euro className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Couriers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+235</div>
                        <p className="text-xs text-muted-foreground">+18 from last week</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deliveries Today</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+1,234</div>
                        <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Awaiting manual review</p>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Placeholder for recent activity feed...</p>
                    </CardContent>
                 </Card>
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Placeholder for system health status...</p>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
