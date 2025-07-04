
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X, MapPin, Euro, Clock, Wallet, Route, Star, CheckCircle, BarChart, ListOrdered } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceDashboard from "@/components/dunlivrer/performance-dashboard";
import { useJobs, type Job } from "@/context/jobs-context";

// --- Components for Driver View ---

const JobCard = ({ job, onAccept, onDecline }: { job: Job, onAccept: (id: string) => void, onDecline: (id: string) => void }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <Card className="bg-card/80 border-white/10 shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <CardTitle className="text-xl font-headline">New Delivery Request</CardTitle>
                            <CardDescription>A new delivery is available near you.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-primary w-16 text-right">FROM</span>
                        <p className="text-sm font-medium">{job.pickup}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-accent w-16 text-right">TO</span>
                        <p className="text-sm font-medium">{job.dropoff}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Payout</p>
                            <p className="font-bold text-lg text-white flex items-center justify-center gap-1"><Euro className="w-4 h-4" />{job.payout}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Distance</p>
                            <p className="font-bold text-lg text-white">{job.distance}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Est. Time</p>
                            <p className="font-bold text-lg text-white">{job.time}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" className="bg-destructive/20 border-destructive/50 text-destructive-foreground hover:bg-destructive/30" onClick={() => onDecline(job.id)}>
                        <X className="mr-2" /> Decline
                    </Button>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => onAccept(job.id)}>
                        <Check className="mr-2" /> Accept
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}

const AvailableJobs = () => {
  const { toast } = useToast();
  const { jobs, removeJob } = useJobs();
  
  const handleAccept = (id: string) => {
      removeJob(id);
      toast({
          title: "Job Accepted!",
          description: "The delivery details have been added to your route."
      })
  }

  const handleDecline = (id: string) => {
      removeJob(id);
      toast({
          variant: "destructive",
          title: "Job Declined",
          description: "You will not be shown this request again."
      })
  }

  return (
    <div className="mt-6 space-y-8">
      {jobs.length > 0 ? jobs.map(job => (
          <JobCard key={job.id} job={job} onAccept={handleAccept} onDecline={handleDecline} />
      )) : (
          <Card className="text-center p-12 bg-card/50 border-white/10">
              <CardTitle className="font-headline text-2xl">All Clear!</CardTitle>
              <CardDescription className="mt-2">There are no available jobs right now. We'll notify you when a new one comes in.</CardDescription>
          </Card>
      )}
    </div>
  )
}

const DriverDashboard = () => {
    const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
        <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div>
                <h1 className="text-4xl font-bold font-headline text-white">Driver Dashboard</h1>
                <p className="mt-1 text-lg text-muted-foreground">Welcome back, let's get rolling.</p>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border-white/10">
                <Switch id="online-status" checked={isOnline} onCheckedChange={setIsOnline} />
                <Label htmlFor="online-status" className={cn("font-medium", isOnline ? "text-green-400" : "text-muted-foreground")}>
                    {isOnline ? "You are Online" : "You are Offline"}
                </Label>
            </div>
        </motion.div>

        <Tabs defaultValue="jobs" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs"><ListOrdered className="mr-2"/>Available Jobs</TabsTrigger>
                <TabsTrigger value="performance"><BarChart className="mr-2"/>Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                <AvailableJobs />
            </TabsContent>
            <TabsContent value="performance" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                <Card className="mt-6 bg-transparent border-none shadow-none">
                    <CardHeader className="px-0">
                        <CardTitle className="font-headline text-2xl">End-of-Day Performance</CardTitle>
                        <CardDescription>Review your stats and get AI-powered tips to improve.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <PerformanceDashboard />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};


// --- Component for Public/Logged-out View ---

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

const DriverLandingPage = () => {
    const features = [
        {
            icon: <Clock className="w-8 h-8 text-primary"/>,
            title: "Drive on Your Schedule",
            description: "You're the boss. Choose when you want to drive and for how long. Work part-time, full-time, or just for a few hours."
        },
        {
            icon: <Wallet className="w-8 h-8 text-primary"/>,
            title: "Earn Competitive Rates",
            description: "Get paid weekly for your deliveries. Our transparent pay structure means you always know how much you'll make."
        },
        {
            icon: <Route className="w-8 h-8 text-primary"/>,
            title: "Smart, Efficient Routes",
            description: "Our AI-powered system optimizes your routes, helping you complete more deliveries in less time and maximize your earnings."
        }
    ];

    return (
        <div className="w-full pt-24 md:pt-32">
            <motion.section 
                className="text-center w-full max-w-4xl mx-auto px-4 md:px-8"
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
            >
                <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold font-headline text-white">Become a DunGuy</motion.h1>
                <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Join the future of delivery. Earn money by delivering packages for local businesses and people in your city.
                </motion.p>
                <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild>
                      <Link href="/signup?redirect=/driver">Sign Up to Drive</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/signin?redirect=/driver">Already have an account? Sign In</Link>
                    </Button>
                </motion.div>
            </motion.section>

            <motion.section 
                className="py-16 mt-12 bg-background/20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
            >
                <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map(feature => (
                            <motion.div key={feature.title} variants={itemVariants} className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-lg flex flex-col items-start gap-4 text-left">
                                {feature.icon}
                                <h3 className="text-xl font-bold font-headline text-white">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    );
}

// --- Main Page Component ---

const LoadingSkeleton = () => (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
        <div className="flex justify-between items-center">
            <div>
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-48 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full mt-8" />
        <div className="mt-6">
            <div className="space-y-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    </div>
);


export default function DriverPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSkeleton />;
    }

    return user ? <DriverDashboard /> : <DriverLandingPage />;
}
