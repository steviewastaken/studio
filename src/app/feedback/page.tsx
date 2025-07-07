
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Smile, Meh, Frown, Sparkles, Flag, CheckCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleDetectEmotion } from '@/lib/actions';
import type { DetectEmotionOutput } from '@/ai/flows/detect-emotion';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';


// New form schema
const feedbackFormSchema = z.object({
  rating: z.enum(['Positive', 'Neutral', 'Negative'], { required_error: 'Please select a rating.' }),
  details: z.string().min(10, 'Please provide at least 10 characters of feedback.'),
  trackingId: z.string().optional(),
});


const CameraAnalysis = () => {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DetectEmotionOutput | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    useEffect(() => {
        const getCameraPermission = async () => {
            if (!canvasRef.current) {
                canvasRef.current = document.createElement('canvas');
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this feature.',
                });
            }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);

    const handleCaptureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsLoading(true);
        setAnalysisResult(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUri);

            const result = await handleDetectEmotion({ photoDataUri: dataUri });

            if (result.success && result.data) {
                setAnalysisResult(result.data);
                toast({
                    title: "Analysis Complete",
                    description: `Emotion detected: ${result.data.emotion}`
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Analysis Failed",
                    description: result.error
                });
                setCapturedImage(null);
            }
        }
        setIsLoading(false);
    };

    const emotionIcons: { [key: string]: React.ReactNode } = {
        'Positive': <Smile className="w-16 h-16 text-green-500" />,
        'Neutral': <Meh className="w-16 h-16 text-yellow-500" />,
        'Negative': <Frown className="w-16 h-16 text-red-500" />,
    };

    const emotionColors: { [key: string]: string } = {
        'Positive': 'border-green-500/50 bg-green-500/10',
        'Neutral': 'border-yellow-500/50 bg-yellow-500/10',
        'Negative': 'border-red-500/50 bg-red-500/10',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                </div>
                {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser to use this feature.
                        </AlertDescription>
                    </Alert>
                )}
                <Button
                    size="lg"
                    onClick={handleCaptureAndAnalyze}
                    disabled={isLoading || hasCameraPermission !== true}
                    className="w-full"
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Camera className="mr-2" />}
                    {isLoading ? "Analyzing..." : "Capture & Analyze"}
                </Button>
            </div>
            <div className="flex flex-col justify-center items-center min-h-[300px]">
                {isLoading && <Loader2 className="w-12 h-12 animate-spin text-primary" />}
                
                {!isLoading && !analysisResult && (
                    <div className="text-center text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="font-semibold text-lg text-white">AI Analysis Results</h3>
                        <p>Results from your interaction analysis will appear here.</p>
                    </div>
                )}

                {analysisResult && (
                    <motion.div
                        className={`w-full p-6 rounded-lg border text-center ${emotionColors[analysisResult.emotion]}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {emotionIcons[analysisResult.emotion]}
                        <h3 className="text-2xl font-bold mt-4">{analysisResult.emotion}</h3>
                        <p className="text-muted-foreground mt-2">{analysisResult.analysis}</p>
                        
                        <div className="text-left mt-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary shrink-0"><Sparkles className="w-5 h-5"/></div>
                                <div>
                                <h4 className="font-semibold">Coaching Feedback</h4>
                                <p className="text-sm text-muted-foreground">{analysisResult.coaching_feedback}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${analysisResult.flagged ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-500'}`}>
                                {analysisResult.flagged ? <Flag className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                                </div>
                                <div>
                                <h4 className="font-semibold">Manager Review</h4>
                                <p className="text-sm text-muted-foreground">{analysisResult.flagged ? "This interaction is flagged for manager review." : "No follow-up needed."}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

const FeedbackForm = () => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof feedbackFormSchema>>({
        resolver: zodResolver(feedbackFormSchema),
        defaultValues: {
            details: "",
            trackingId: "",
        }
    });

    const { isSubmitting } = form.formState;

    const onSubmit = (values: z.infer<typeof feedbackFormSchema>) => {
        console.log(values);
        toast({
            title: "Feedback Submitted!",
            description: "Thank you for helping us improve our service.",
        });
        form.reset();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Overall Experience</FormLabel>
                                <FormControl>
                                    <div className="flex justify-center gap-4 pt-2">
                                        <Button type="button" variant="outline" size="lg" onClick={() => field.onChange('Positive')} className={cn(field.value === 'Positive' && 'ring-2 ring-green-500')}>
                                            <Smile className="mr-2 text-green-500" /> Positive
                                        </Button>
                                        <Button type="button" variant="outline" size="lg" onClick={() => field.onChange('Neutral')} className={cn(field.value === 'Neutral' && 'ring-2 ring-yellow-500')}>
                                            <Meh className="mr-2 text-yellow-500" /> Neutral
                                        </Button>
                                        <Button type="button" variant="outline" size="lg" onClick={() => field.onChange('Negative')} className={cn(field.value === 'Negative' && 'ring-2 ring-red-500')}>
                                            <Frown className="mr-2 text-red-500" /> Negative
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="details"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Feedback Details</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell us about the interaction, what went well, or what could be improved..." rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="trackingId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tracking ID (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., DNLVR-12345" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                        Submit Feedback
                    </Button>
                </form>
            </Form>
        </div>
    )
}


export default function FeedbackPage() {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">Delivery Feedback</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Analyze customer reactions using AI or submit manual feedback to help us ensure service quality and provide valuable coaching to our couriers.
                </p>
            </motion.div>

            <Card className="mt-12 bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                <CardContent className="p-6">
                    <Tabs defaultValue="ai-analysis" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ai-analysis"><Sparkles className="mr-2" />AI Emotion Analysis</TabsTrigger>
                            <TabsTrigger value="manual-form"><FileText className="mr-2" />Manual Feedback Form</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ai-analysis" className="mt-6">
                           <CameraAnalysis />
                        </TabsContent>
                        <TabsContent value="manual-form" className="mt-6">
                           <FeedbackForm />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
