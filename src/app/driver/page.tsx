
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X, MapPin, Euro, Clock, Wallet, Route, Star, CheckCircle, BarChart, ListOrdered, AlertTriangle, Lightbulb, Loader2, PartyPopper, Camera, ArrowRight, Pickaxe, Navigation, Package } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import PerformanceDashboard from "@/components/dunlivrer/performance-dashboard";
import { useJobs, type Job } from "@/context/jobs-context";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/context/language-context";
import { useRouter } from "next/navigation";
import MapComponent from "@/components/dunlivrer/map-component";
import Image from "next/image";


// --- Job Acceptance Component ---
const JobCard = ({ job, onAccept, onDecline }: { job: Job, onAccept: (job: Job) => void, onDecline: (id: string) => void }) => {
    const suggestionColors = {
        accept: 'text-green-400',
        neutral: 'text-amber-400',
    };

    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <Card className="bg-card/80 border-white/10 shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                    <CardTitle className="text-xl font-headline">New Delivery Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3"><span className="text-xs font-bold text-primary w-16 text-right">FROM</span><p className="text-sm font-medium">{job.pickup}</p></div>
                    <div className="flex items-start gap-3"><span className="text-xs font-bold text-accent w-16 text-right">TO</span><p className="text-sm font-medium">{job.dropoff}</p></div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4 text-center py-2">
                        <div><p className="text-xs text-muted-foreground">Payout</p><p className="font-bold text-lg text-white flex items-center justify-center gap-1"><Euro className="w-4 h-4" />{job.payout}</p></div>
                        <div><p className="text-xs text-muted-foreground">Distance</p><p className="font-bold text-lg text-white">{job.distance}</p></div>
                        <div><p className="text-xs text-muted-foreground">Est. Time</p><p className="font-bold text-lg text-white">{job.time}</p></div>
                    </div>
                    {job.safetyAlert && (<Alert variant="destructive" className="bg-destructive/10 border-destructive/30"><AlertTriangle className="h-5 w-5 !text-destructive" /><AlertTitle className="font-bold text-destructive">Safety Alert</AlertTitle><AlertDescription className="text-destructive/90">{job.safetyAlert.message}</AlertDescription></Alert>)}
                    <Separator />
                    <div className={cn("mt-4 p-4 rounded-lg flex items-start gap-3", job.suggestionType === 'accept' ? 'bg-green-500/10' : 'bg-amber-500/10')}><Lightbulb className={cn("w-5 h-5 mt-0.5 shrink-0", suggestionColors[job.suggestionType])} /><div><h4 className={cn("font-semibold text-sm", suggestionColors[job.suggestionType])}>AI Suggestion</h4><p className={cn("text-sm opacity-80", suggestionColors[job.suggestionType])}>{job.suggestion}</p></div></div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" className="bg-destructive/20 border-destructive/50 text-destructive-foreground hover:bg-destructive/30" onClick={() => onDecline(job.id)}><X className="mr-2" /> Decline</Button>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => onAccept(job)}><Check className="mr-2" /> Accept</Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}

const AvailableJobs = ({ onAcceptJob }: { onAcceptJob: (job: Job) => void }) => {
    const { toast } = useToast();
    const { jobs, removeJob } = useJobs();
    const { content } = useLanguage();
  
    const handleDecline = (id: string) => {
        removeJob(id);
        toast({ variant: "destructive", title: "Job Declined" });
    }

    return (
      <div className="mt-6 space-y-8">
        <AnimatePresence>
            {jobs.length > 0 ? jobs.map(job => (
                <JobCard key={job.id} job={job} onAccept={onAcceptJob} onDecline={handleDecline} />
            )) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="text-center p-12 bg-card/50 border-white/10">
                        <CardTitle className="font-headline text-2xl">{content.driver_dashboard_no_jobs_title}</CardTitle>
                        <CardDescription className="mt-2">{content.driver_dashboard_no_jobs_desc}</CardDescription>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    )
}


const ActiveDeliveryMap = ({ job, onComplete }: { job: Job, onComplete: (payout: number) => void }) => {
    type Step = 'to_pickup' | 'at_pickup' | 'to_dropoff' | 'at_dropoff' | 'capturing_photo';
    const [step, setStep] = useState<Step>('to_pickup');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Photo capture state
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Handle camera permission when needed
    useEffect(() => {
        if (step !== 'capturing_photo' || hasCameraPermission) return;
        
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }

        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setHasCameraPermission(true);
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            setStep('at_dropoff'); // Go back a step if camera fails
            toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions to complete the delivery.' });
          }
        };
        getCameraPermission();
        
        // Cleanup function
        return () => {
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
        }
    }, [step, hasCameraPermission, toast]);


    const handleAction = () => {
        setIsLoading(true);
        setTimeout(() => {
            switch (step) {
                case 'to_pickup':
                    setStep('at_pickup');
                    toast({ title: "Arrived at Pickup!", description: `Confirm you have the package from ${job.pickup}.` });
                    break;
                case 'at_pickup':
                    setStep('to_dropoff');
                    toast({ title: "Package Picked Up!", description: `Now heading to ${job.dropoff}.` });
                    break;
                case 'to_dropoff':
                    setStep('at_dropoff');
                    toast({ title: "Arrived at Destination!", description: `Confirm delivery to complete the job.` });
                    break;
                case 'at_dropoff':
                    setStep('capturing_photo');
                    break;
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleCapturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUri);
            setStep('at_dropoff'); // Go back to confirmation view
             // Stop the camera stream
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    };

    const handleSubmitDelivery = () => {
        onComplete(parseFloat(job.payout));
    };

    const getRoute = () => {
        const simulatedStartPoint = 'Porte Maillot, 75017 Paris, France';
        
        switch (step) {
            case 'to_pickup':
                return { origin: simulatedStartPoint, destination: job.pickup };
            case 'at_pickup':
                return { origin: job.pickup, destination: null };
            case 'to_dropoff':
                return { origin: job.pickup, destination: job.dropoff };
            case 'at_dropoff':
            case 'capturing_photo':
                return { origin: job.dropoff, destination: null };
            default:
                return { origin: null, destination: null };
        }
    };

    const route = getRoute();
    const isNavigating = step === 'to_pickup' || step === 'to_dropoff';

    return (
        <div className="fixed inset-0 bg-background z-50 pt-16">
            <MapComponent
                origin={route.origin}
                destination={route.destination}
                isNavigating={isNavigating}
            />

            {step === 'capturing_photo' ? (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 gap-4 z-20">
                    <video ref={videoRef} className="w-full max-w-lg aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                     {hasCameraPermission === false && (
                        <Alert variant="destructive"><AlertTitle>Camera Access Required</AlertTitle></Alert>
                    )}
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setStep('at_dropoff')}>Cancel</Button>
                        <Button size="lg" onClick={handleCapturePhoto} disabled={hasCameraPermission !== true}>
                            <Camera className="mr-2"/> Take Photo
                        </Button>
                    </div>
                </div>
            ) : (
                 <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                    <Card className="bg-card/90 backdrop-blur-lg border-white/10 max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{isNavigating ? "On Route" : "At Location"}</CardTitle>
                            <CardDescription>
                                {step === 'to_pickup' && `Head to the pickup location.`}
                                {step === 'at_pickup' && `You have arrived at the pickup location.`}
                                {step === 'to_dropoff' && `Head to the destination.`}
                                {step === 'at_dropoff' && `You have arrived at the destination.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                               <div className="p-2 bg-primary/20 rounded-md text-primary"><MapPin/></div>
                               <div>
                                 <p className="text-xs text-muted-foreground">{step === 'to_pickup' || step === 'at_pickup' ? "Pickup" : "Destination"}</p>
                                 <p className="font-semibold">{step === 'to_pickup' || step === 'at_pickup' ? job.pickup : job.dropoff}</p>
                               </div>
                            </div>
                            {capturedImage && step === 'at_dropoff' && (
                                <div className="space-y-2">
                                    <Label>Proof of Delivery</Label>
                                    <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                        <Image src={capturedImage} layout="fill" objectFit="cover" alt="Proof of delivery"/>
                                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => setCapturedImage(null)}><X className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            {step === 'at_dropoff' && capturedImage ? (
                                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmitDelivery}>
                                    <CheckCircle className="mr-2" /> Complete Delivery & Get Paid
                                </Button>
                            ) : (
                                <Button size="lg" className="w-full" onClick={handleAction} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 animate-spin"/>}
                                    {step === 'to_pickup' && <><Navigation className="mr-2"/>Arrived at Pickup</>}
                                    {step === 'at_pickup' && <><Package className="mr-2"/>Confirm Package Pickup</>}
                                    {step === 'to_dropoff' && <><Navigation className="mr-2"/>Arrived at Destination</>}
                                    {step === 'at_dropoff' && <><Camera className="mr-2"/>Take Proof of Delivery Photo</>}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                 </div>
            )}
        </div>
    );
}

// --- Main Driver Dashboard Component ---
const DriverDashboard = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const { content } = useLanguage();
    const { removeJob } = useJobs();
    const { toast } = useToast();
    
    const [stats, setStats] = useState({ earnings: 145.80, timeHours: 6, deliveries: 12 });
    
    const handleAcceptJob = (job: Job) => {
        removeJob(job.id);
        setCurrentJob(job);
        toast({ title: "Job Accepted!", description: "Starting new delivery. Follow the map instructions." });
    }

    const handleCompleteJob = (payout: number) => {
        toast({
            title: "Delivery Complete!",
            description: `Payment of €${payout.toFixed(2)} has been added to your earnings.`,
        });
        setStats(prev => ({
            ...prev,
            earnings: prev.earnings + payout,
            deliveries: prev.deliveries + 1,
        }));
        setCurrentJob(null);
    }
    
    // Render the active delivery map if a job is accepted
    if (currentJob) {
        return <ActiveDeliveryMap job={currentJob} onComplete={handleCompleteJob} />
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="text-4xl font-bold font-headline text-white">{content.driver_dashboard_title}</h1>
                    <p className="mt-1 text-lg text-muted-foreground">{content.driver_dashboard_subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild><Link href="/driver/report"><AlertTriangle className="mr-2"/>{content.driver_dashboard_report_button}</Link></Button>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border-white/10">
                        <Switch id="online-status" checked={isOnline} onCheckedChange={setIsOnline} />
                        <Label htmlFor="online-status" className={cn("font-medium", isOnline ? "text-green-400" : "text-muted-foreground")}>{isOnline ? content.driver_dashboard_online : content.driver_dashboard_offline}</Label>
                    </div>
                </div>
            </motion.div>
            
            <motion.div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
                <Card className="bg-card/80 border-white/10"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{content.driver_dashboard_earnings_title}</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">€{stats.earnings.toFixed(2)}</div><p className="text-xs text-muted-foreground">{content.driver_dashboard_earnings_stat}</p></CardContent></Card>
                <Card className="bg-card/80 border-white/10"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{content.driver_dashboard_time_title}</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.timeHours}h 24m</div><p className="text-xs text-muted-foreground">{content.driver_dashboard_time_stat}</p></CardContent></Card>
                <Card className="bg-card/80 border-white/10"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{content.driver_dashboard_deliveries_title}</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">+{stats.deliveries}</div><p className="text-xs text-muted-foreground">{content.driver_dashboard_deliveries_stat}</p></CardContent></Card>
                <Card className="bg-card/80 border-white/10"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{content.driver_dashboard_rating_title}</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">4.9/5.0</div><p className="text-xs text-muted-foreground">{content.driver_dashboard_rating_stat}</p></CardContent></Card>
            </motion.div>
            
             <Card className="mt-8 bg-card/80 border-white/10">
                <CardHeader>
                    <CardTitle>Available Jobs</CardTitle>
                    <CardDescription>Accept a job to start a delivery.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AvailableJobs onAcceptJob={handleAcceptJob} />
                </CardContent>
            </Card>

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
    const { content } = useLanguage();
    const features = [
        {
            icon: <Clock className="w-8 h-8 text-primary"/>,
            title: content.driver_feature1_title,
            description: content.driver_feature1_desc,
        },
        {
            icon: <Wallet className="w-8 h-8 text-primary"/>,
            title: content.driver_feature2_title,
            description: content.driver_feature2_desc,
        },
        {
            icon: <Route className="w-8 h-8 text-primary"/>,
            title: content.driver_feature3_title,
            description: content.driver_feature3_desc,
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
                <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold font-headline text-white">{content.driver_landing_title}</motion.h1>
                <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    {content.driver_landing_subtitle}
                </motion.p>
                <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild>
                      <Link href="/signup?as=driver">{content.driver_landing_signup_button}</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/signin?redirect=/driver">{content.driver_landing_signin_button}</Link>
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

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
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


const KycPending = () => (
    <div className="w-full h-screen flex items-center justify-center">
        <Card className="p-8 text-center bg-card/80 border-white/10 max-w-lg">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
            <CardTitle className="font-headline text-3xl mt-4">Verification Pending</CardTitle>
            <CardDescription className="mt-2">
                Your documents have been submitted successfully. Our team is reviewing your application, which usually takes 1-2 business days. We'll notify you via email once it's complete.
            </CardDescription>
        </Card>
    </div>
);

const KycRejected = () => {
    const router = useRouter();
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Card className="p-8 text-center bg-card/80 border-destructive/30 max-w-lg">
                <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
                <CardTitle className="font-headline text-3xl mt-4">Verification Required</CardTitle>
                <CardDescription className="mt-2 text-destructive-foreground">
                    There was an issue with your submitted documents. Please re-submit them with clear and valid images.
                </CardDescription>
                <Button onClick={() => router.push('/driver/kyc')} className="mt-6">
                    Re-submit Documents
                </Button>
            </Card>
        </div>
    );
};


export default function DriverPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return <LoadingSkeleton />;
    }
    
    const isDriver = user?.role === 'driver';

    if (!isDriver) {
        return <DriverLandingPage />;
    }

    switch (user.kycStatus) {
        case 'pending':
            // Since auto-approval is now in place, this state is less likely to be seen by the user.
            return <KycPending />;
        case 'rejected':
        case 'none':
            router.push('/driver/kyc'); // Redirect to re-submit
            return <LoadingSkeleton />;
        case 'verified':
            return <DriverDashboard />;
        default:
            return <DriverLandingPage />;
    }
}
