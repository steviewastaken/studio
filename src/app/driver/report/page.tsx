"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Loader2, Send, FileText, Siren, AlertTriangle, Package, User, HardHat, Camera, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { handleCreateIncidentReport } from '@/lib/actions';
import type { CreateIncidentReportInput, CreateIncidentReportOutput } from '@/ai/flows/create-incident-report';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// For SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ReportResultCard = ({ report, capturedImage, onConfirm, onDiscard }: { report: CreateIncidentReportOutput, capturedImage: string | null, onConfirm: () => void, onDiscard: () => void }) => {
    const urgencyColors: {[key: string]: string} = {
        'Low': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        'High': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'Critical': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    
    const incidentIcons: {[key: string]: React.ReactNode} = {
        'Customer No-Show': <User className="w-5 h-5" />,
        'Vehicle Issue': <Siren className="w-5 h-5" />,
        'Package Damaged': <Package className="w-5 h-5" />,
        'Incorrect Address': <FileText className="w-5 h-5" />,
        'Safety Concern': <AlertTriangle className="w-5 h-5" />,
        'Other': <HardHat className="w-5 h-5" />,
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="bg-card/80 border-white/10">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">AI-Generated Report</CardTitle>
                    <CardDescription>Please review the structured report below before sending it to support.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {capturedImage && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                            <Image src={capturedImage} alt="Incident report photo" layout="fill" objectFit="cover" />
                        </div>
                    )}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-primary/20 rounded-md text-primary">{incidentIcons[report.incidentType]}</span>
                            <span className="font-semibold">{report.incidentType}</span>
                        </div>
                        <Badge variant="outline" className={cn(urgencyColors[report.urgency])}>
                           Urgency: {report.urgency}
                        </Badge>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold">Summary</h4>
                        <p className="text-muted-foreground italic">"{report.summary}"</p>
                        
                        <h4 className="font-semibold">Suggested Action</h4>
                        <p className="text-muted-foreground">{report.suggestedAction}</p>

                        {(report.entities.customerName || report.entities.trackingId || report.entities.vehicleDetails) && (
                            <>
                                <h4 className="font-semibold">Extracted Details</h4>
                                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                                    {report.entities.customerName && <li>Customer: {report.entities.customerName}</li>}
                                    {report.entities.trackingId && <li>Tracking ID: {report.entities.trackingId}</li>}
                                    {report.entities.vehicleDetails && <li>Vehicle Note: {report.entities.vehicleDetails}</li>}
                                </ul>
                            </>
                        )}
                    </div>
                </CardContent>
                <CardContent className="flex gap-4">
                     <Button onClick={onDiscard} variant="outline" className="w-full">Discard & Edit</Button>
                     <Button onClick={onConfirm} className="w-full">Confirm & Send Report</Button>
                </CardContent>
            </Card>
        </motion.div>
    )
}


export default function ReportIncidentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<CreateIncidentReportOutput | null>(null);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.lang = 'en-US'; // or 'fr-FR' for french
                recognitionRef.current.interimResults = false;

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
                    setIsListening(false);
                };
                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    toast({ variant: "destructive", title: "Voice Error", description: "Couldn't recognize audio. Please try again or type."});
                    setIsListening(false);
                };
                 recognitionRef.current.onend = () => {
                    if (isListening) {
                      setIsListening(false);
                    }
                };
            }
        }
    }, [toast, isListening]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast({ variant: "destructive", title: "Not Supported", description: "Your browser does not support speech recognition."});
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    
    const handleSubmit = async () => {
        if (!description.trim()) {
            toast({ variant: "destructive", title: "Empty Report", description: "Please describe the incident."});
            return;
        }
        setIsLoading(true);
        setGeneratedReport(null);

        const inputData: CreateIncidentReportInput = { description };
        if (imagePreview) {
            inputData.photoDataUri = imagePreview;
        }

        const result = await handleCreateIncidentReport(inputData);
        
        if (result.success && result.data) {
            setGeneratedReport(result.data);
        } else {
            toast({ variant: "destructive", title: "Report Failed", description: result.error });
        }

        setIsLoading(false);
    };
    
    const confirmAndSend = () => {
        toast({ title: "Report Sent!", description: "Support has been notified of the incident." });
        router.push('/driver');
    };
    
    const discardReport = () => {
        setGeneratedReport(null);
        // Don't clear the description or image, so the user can edit
    }

    if (!user) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pt-24 md:pt-32 text-center">
                 <Card className="p-8">
                     <CardTitle>Access Denied</CardTitle>
                     <CardDescription className="mt-2">You must be logged in to report an incident.</CardDescription>
                     <Button onClick={() => router.push('/signin?redirect=/driver/report')} className="mt-4">Sign In</Button>
                 </Card>
            </div>
        )
    }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
        <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">Report an Incident</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Quickly report issues from the road. Speak or type what happened, and optionally add a photo. Our AI will handle the rest.
            </p>
        </motion.div>

        <div className="mt-12">
            <AnimatePresence mode="wait">
                {!generatedReport ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                            <CardHeader>
                                <CardTitle>Describe the Incident</CardTitle>
                                <CardDescription>Be as detailed as possible. Mention tracking numbers or customer names if you can.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {imagePreview && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                                        <Image src={imagePreview} alt="Incident preview" layout="fill" objectFit="cover" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 z-10 h-8 w-8"
                                            onClick={() => {
                                                setImagePreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                 <Textarea 
                                    placeholder="e.g., 'Customer at 123 Main St didn't answer after 3 tries. The package is damaged. I have attached a photo.'" 
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isLoading}
                                 />
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden"
                                    accept="image/*"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                     <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full" disabled={isLoading}>
                                        <Camera className="mr-2" /> {imagePreview ? 'Change Photo' : 'Add Photo'}
                                     </Button>
                                    <Button onClick={toggleListening} variant="outline" className="w-full" disabled={!recognitionRef.current || isLoading}>
                                        {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                                        {isListening ? 'Stop Listening' : 'Use Voice'}
                                    </Button>
                                </div>
                                <Button onClick={handleSubmit} disabled={isLoading || !description} className="w-full" size="lg">
                                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                    {isLoading ? 'Analyzing...' : 'Generate Report'}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <ReportResultCard 
                        key="result" 
                        report={generatedReport}
                        capturedImage={imagePreview}
                        onConfirm={confirmAndSend}
                        onDiscard={discardReport}
                    />
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}
