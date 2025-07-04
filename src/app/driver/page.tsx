"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X, MapPin, Milestone, Euro } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const availableJobs = [
  {
    id: 'job1',
    pickup: '123 Rue de Rivoli, 75001 Paris',
    dropoff: 'Eiffel Tower, Champ de Mars, 75007 Paris',
    distance: '5.2 km',
    payout: '12.50',
    time: '25 min',
  },
  {
    id: 'job2',
    pickup: 'Gare du Nord, 75010 Paris',
    dropoff: 'La Défense, 92800 Puteaux',
    distance: '10.8 km',
    payout: '18.75',
    time: '45 min',
  },
  {
    id: 'job3',
    pickup: 'Montmartre, 75018 Paris',
    dropoff: 'Louvre Museum, 75001 Paris',
    distance: '4.1 km',
    payout: '10.00',
    time: '20 min',
  },
   {
    id: 'job4',
    pickup: 'Opéra Garnier, 75009 Paris',
    dropoff: 'Place des Vosges, 75004 Paris',
    distance: '3.5 km',
    payout: '9.50',
    time: '18 min',
  }
];

const JobCard = ({ job, onAccept, onDecline }: { job: typeof availableJobs[0], onAccept: (id: string) => void, onDecline: (id: string) => void }) => {
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


export default function DriverPage() {
    const { toast } = useToast();
    const [jobs, setJobs] = useState(availableJobs);

    const handleAccept = (id: string) => {
        setJobs(prev => prev.filter(job => job.id !== id));
        toast({
            title: "Job Accepted!",
            description: "The delivery details have been added to your route."
        })
    }

    const handleDecline = (id: string) => {
        setJobs(prev => prev.filter(job => job.id !== id));
        toast({
            variant: "destructive",
            title: "Job Declined",
            description: "You will not be shown this request again."
        })
    }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
        <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">Available Jobs</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Here are the delivery requests currently available in your area.
            </p>
        </motion.div>

        <div className="mt-12 space-y-8">
            {jobs.length > 0 ? jobs.map(job => (
                <JobCard key={job.id} job={job} onAccept={handleAccept} onDecline={handleDecline} />
            )) : (
                <Card className="text-center p-12 bg-card/50 border-white/10">
                    <CardTitle className="font-headline text-2xl">All Clear!</CardTitle>
                    <CardDescription className="mt-2">There are no available jobs right now. We'll notify you when a new one comes in.</CardDescription>
                </Card>
            )}
        </div>
    </div>
  );
}
