
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Loader2, Send, Package2, Trash2, PlusCircle, Truck, ShieldAlert, ShieldQuestion, Shield } from 'lucide-react';
import { handleGetQuote, handleDetectFraud, handleGetInsuranceQuote } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { GetQuoteOutput } from '@/ai/flows/get-quote';
import type { DetectFraudOutput, DetectFraudInput } from '@/ai/flows/detect-fraud';
import type { GetInsuranceQuoteOutput } from '@/ai/flows/get-insurance-quote';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useJobs } from '@/context/jobs-context';
import AddressInput from './address-input';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  pickupAddress: z.string({ required_error: "Please select a pickup location."}).min(1, "Please select a pickup location."),
  destinationAddresses: z.array(
    z.object({
      value: z.string().min(1, "Destination cannot be empty.")
    })
  ).min(1, "Please add at least one destination."),
  packageSize: z.enum(['small', 'medium', 'large']),
  deliveryType: z.enum(['standard', 'express', 'night']),
});


type DeliveryFormProps = {
  onAddressChange: (addresses: { pickup: string | null; destinations: string[] }) => void;
  onQuoteChange: (quote: GetQuoteOutput | null) => void;
  onInsuranceChange: (quote: GetInsuranceQuoteOutput | null) => void;
  quote: GetQuoteOutput | null;
  insuranceQuote: GetInsuranceQuoteOutput | null;
  isReviewed: boolean;
  isGettingQuote: boolean;
  setIsGettingQuote: (loading: boolean) => void;
};

export default function DeliveryForm({ onAddressChange, onQuoteChange, onInsuranceChange, quote, insuranceQuote, isReviewed, isGettingQuote, setIsGettingQuote }: DeliveryFormProps) {
  const { user } = useAuth();
  const { addJob } = useJobs();
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [isCheckingFraud, setIsCheckingFraud] = useState(false);
  const [fraudResult, setFraudResult] = useState<DetectFraudOutput | null>(null);
  const [showFraudDialog, setShowFraudDialog] = useState(false);

  // Insurance Dialog State
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [declaredValue, setDeclaredValue] = useState('');
  const [packageCategory, setPackageCategory] = useState('');
  const [isCheckingInsurance, setIsCheckingInsurance] = useState(false);
  const [localInsuranceQuote, setLocalInsuranceQuote] = useState<GetInsuranceQuoteOutput | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickupAddress: "",
      destinationAddresses: [{ value: "" }],
      packageSize: "medium",
      deliveryType: "standard",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "destinationAddresses"
  });

  const { watch } = form;

  const handleAddressChangeCallback = useCallback((value: z.infer<typeof formSchema>) => {
    onAddressChange({
      pickup: value.pickupAddress,
      destinations: value.destinationAddresses.map(d => d.value),
    });
  }, [onAddressChange]);

  useEffect(() => {
    const subscription = watch((value) => {
        handleAddressChangeCallback(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [watch, handleAddressChangeCallback]);


  async function onGetQuote(values: z.infer<typeof formSchema>) {
    setIsGettingQuote(true);
    onQuoteChange(null);
    onInsuranceChange(null);

    if (typeof window.google === 'undefined' || typeof window.google.maps.DirectionsService === 'undefined') {
        toast({ variant: 'destructive', title: "Map Error", description: "Google Maps service is not available." });
        setIsGettingQuote(false);
        return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const validDestinations = values.destinationAddresses.map(d => d.value).filter(d => d && d.trim() !== '');

    const waypoints = validDestinations.slice(0, -1).map(d => ({ location: d, stopover: true }));
    const finalDestination = validDestinations[validDestinations.length - 1];

    try {
        const directionsResult = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            directionsService.route({
                origin: values.pickupAddress,
                destination: finalDestination,
                waypoints: waypoints,
                travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === 'OK' && result) {
                    resolve(result);
                } else {
                    reject(new Error(`Directions request failed: ${status}`));
                }
            });
        });

        const route = directionsResult.routes[0];
        if (!route) {
            throw new Error("No route found in the directions result.");
        }
        
        let totalDistanceMeters = 0;
        let totalDurationSeconds = 0;
        route.legs.forEach(leg => {
            totalDistanceMeters += leg.distance?.value || 0;
            totalDurationSeconds += leg.duration?.value || 0;
        });

        if (totalDistanceMeters === 0) {
            throw new Error("Calculated route distance is zero.");
        }

        const result = await handleGetQuote({
            pickupAddress: values.pickupAddress,
            destinationAddresses: validDestinations,
            packageSize: values.packageSize,
            deliveryType: values.deliveryType,
            distanceMeters: totalDistanceMeters,
            durationSeconds: totalDurationSeconds,
        });

        if (result.success && result.data) {
            onQuoteChange(result.data);
            toast({
                title: "Quote Generated!",
                description: "Review your AI estimate on the right.",
            });
        } else {
            onQuoteChange(null);
            toast({
                variant: 'destructive',
                title: "Quotation Failed",
                description: result.error,
            });
        }
    } catch (error: any) {
        onQuoteChange(null);
        toast({
            variant: 'destructive',
            title: "Route Not Found",
            description: "Could not find a valid route. Please check the addresses and try again.",
        });
    } finally {
        setIsGettingQuote(false);
    }
  }

  const postDeliveryJob = () => {
    const values = form.getValues();
    if (quote) {
      const newJob = {
        id: `job-${Date.now()}`,
        pickup: values.pickupAddress,
        dropoff: values.destinationAddresses[values.destinationAddresses.length - 1].value,
        distance: quote.distance,
        payout: ((quote.price + (insuranceQuote?.premium || 0)) * 0.8).toFixed(2),
        time: quote.eta,
      };
      addJob(newJob);
      toast({
        title: "Delivery Posted!",
        description: "Your delivery request has been sent to nearby DunGuys.",
      });
      resetFormState();
    }
  };

  const resetFormState = () => {
    onQuoteChange(null);
    onInsuranceChange(null);
    form.reset();
  }

  const handleConfirmDispatch = async () => {
    const values = form.getValues();
    if (!values.pickupAddress || !quote) {
        toast({
            variant: 'destructive',
            title: "Missing Information",
            description: 'Please select a pickup address and get a quote before dispatching.',
        });
        return;
    }

    setIsCheckingFraud(true);

    const mockFraudInput: DetectFraudInput = {
      userId: user?.id || 'guest-user',
      userAccountAgeDays: Math.random() < 0.5 ? 5 : 90, 
      userTotalDeliveries: 15,
      userRefundHistory: Math.random() < 0.3 ? [{ refundId: 'refund-abc', reason: 'Item damaged', amount: 150, date: '2024-05-01' }] : [],
      deliveryValue: Math.random() < 0.4 ? 250 : 80,
      pickupAddress: values.pickupAddress,
      destinationAddress: values.destinationAddresses[0].value,
    };

    const fraudCheckResult = await handleDetectFraud(mockFraudInput);
    setIsCheckingFraud(false);

    if (!fraudCheckResult.success) {
      toast({
        variant: 'destructive',
        title: "Fraud Check Failed",
        description: fraudCheckResult.error,
      });
      return;
    }

    setFraudResult(fraudCheckResult.data);

    if (fraudCheckResult.data.isSuspicious) {
        setShowFraudDialog(true);
    } else {
        postDeliveryJob();
    }
  };
  
  const handleProceedAnyway = () => {
      setShowFraudDialog(false);
      postDeliveryJob();
  };

  const handleScheduleForLater = () => {
    setIsScheduling(true);
  };
  
  const handleConfirmFinalSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please select both a date and a time slot.',
      });
      return;
    }
    setIsScheduling(false);
    resetFormState();
    toast({
      title: 'Delivery Scheduled!',
      description: `Your delivery is scheduled for ${format(scheduledDate, 'PPP')} between ${scheduledTime}.`,
    });
  };

  const handleCalculateInsurance = async () => {
    if (!declaredValue || !packageCategory || !quote) return;
    setIsCheckingInsurance(true);
    setLocalInsuranceQuote(null);

    const result = await handleGetInsuranceQuote({
        deliveryValue: parseFloat(declaredValue),
        packageCategory,
        pickupAddress: form.getValues('pickupAddress'),
        destinationAddress: form.getValues('destinationAddresses')[0].value,
        courierTrustScore: Math.floor(Math.random() * 25) + 75, // Random score between 75-100
    });

    if (result.success && result.data) {
        setLocalInsuranceQuote(result.data);
    } else {
        toast({ variant: 'destructive', title: 'Insurance Quote Failed', description: result.error });
    }
    setIsCheckingInsurance(false);
  };
  
  const handleAddInsurance = () => {
    onInsuranceChange(localInsuranceQuote);
    setShowInsuranceDialog(false);
  };
    
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 9;
    return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
  });

  const isDispatchLoading = isCheckingFraud;

  return (
    <>
      <Card className="w-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGetQuote)}>
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-3"><Package2 className="text-primary"/>Book a Delivery</CardTitle>
              <CardDescription>Fill in your delivery details. Add multiple destinations for a smart route.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <FormControl>
                            <AddressInput placeholder="Enter pickup address..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
              />

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative">
                        <FormField
                            control={form.control}
                            name={`destinationAddresses.${index}.value`}
                            render={({ field }) => (
                               <FormItem>
                                    <FormLabel>Destination {index + 1}</FormLabel>
                                    <FormControl>
                                        <AddressInput placeholder={`Destination #${index + 1}`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {fields.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => remove(index)} className="absolute right-0 top-0 mt-6">
                                <Trash2 className="w-4 h-4 text-destructive"/>
                            </Button>
                        )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                      <PlusCircle className="mr-2"/> Add another destination
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="packageSize"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Package Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select a size" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="small">Small (Up to 3kg)</SelectItem>
                              <SelectItem value="medium">Medium (3-5kg)</SelectItem>
                              <SelectItem value="large">Large (5-10kg)</SelectItem>
                          </SelectContent>
                          </Select>
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="deliveryType"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Delivery Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select delivery type" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="express">Express (&lt;1 hr)</SelectItem>
                              <SelectItem value="night">Night Delivery</SelectItem>
                          </SelectContent>
                          </Select>
                      </FormItem>
                      )}
                  />
                </div>

            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <Button type="submit" disabled={isGettingQuote || isReviewed} size="lg" className="w-full transition-all duration-300 ease-in-out shadow-lg shadow-primary/20 hover:shadow-primary/40">
                {isGettingQuote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isReviewed ? 'Quote Received' : 'Get Quote'}
              </Button>
              {isReviewed && quote && (
                <div className="w-full pt-4 mt-4 border-t border-white/10 border-dashed animate-in fade-in-0 slide-in-from-bottom-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button type="button" variant="outline" size="lg" onClick={handleScheduleForLater}>
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule
                        </Button>
                        <Button type="button" variant="outline" size="lg" onClick={() => setShowInsuranceDialog(true)}>
                            <Shield className="mr-2 h-4 w-4"/>
                            Add Insurance
                        </Button>
                        <Button type="button" onClick={handleConfirmDispatch} size="lg" disabled={isDispatchLoading}>
                            {isCheckingFraud && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isDispatchLoading && <Truck className="mr-2 h-4 w-4" />}
                            {isCheckingFraud ? 'Analyzing...' : 'Dispatch Now'}
                        </Button>
                    </div>
                </div>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Schedule Your Delivery</DialogTitle>
                <DialogDescription>
                    Select a date and a time slot for your pickup.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    className="rounded-md border"
                />
                <Select onValueChange={setScheduledTime} value={scheduledTime}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button onClick={handleConfirmFinalSchedule} size="lg" className="w-full">
                    Confirm Schedule
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showFraudDialog} onOpenChange={setShowFraudDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                {fraudResult?.recommendedAction === 'BLOCK' && <ShieldAlert className="w-12 h-12 text-destructive mx-auto"/>}
                {fraudResult?.recommendedAction === 'MANUAL_REVIEW' && <ShieldQuestion className="w-12 h-12 text-amber-500 mx-auto"/>}
                <AlertDialogTitle className="text-center">
                    {fraudResult?.recommendedAction === 'BLOCK' && 'Transaction Blocked'}
                    {fraudResult?.recommendedAction === 'MANUAL_REVIEW' && 'Transaction Flagged'}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                    <p className="font-semibold">Reason: <span className="font-normal">{fraudResult?.reason}</span></p>
                    <p className="mt-2 text-sm">Risk Score: {fraudResult?.riskScore}/100</p>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                {fraudResult?.recommendedAction === 'BLOCK' && (
                    <>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction asChild><a href="/contact">Contact Support</a></AlertDialogAction>
                    </>
                )}
                {fraudResult?.recommendedAction === 'MANUAL_REVIEW' && (
                     <>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleProceedAnyway}>
                            Proceed Anyway
                        </AlertDialogAction>
                    </>
                )}
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Protect Your Delivery</DialogTitle>
                <DialogDescription>Add insurance to cover the declared value of your item.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Declared Value (€)</FormLabel>
                        <Input 
                            type="number"
                            placeholder="e.g., 500"
                            value={declaredValue}
                            onChange={e => setDeclaredValue(e.target.value)}
                        />
                    </FormItem>
                    <FormItem>
                        <FormLabel>Package Category</FormLabel>
                        <Select onValueChange={setPackageCategory} value={packageCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Jewelry">Jewelry</SelectItem>
                                <SelectItem value="Documents">Documents</SelectItem>
                                <SelectItem value="Clothing">Clothing</SelectItem>
                                <SelectItem value="Art">Art</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                </div>
                <Button onClick={handleCalculateInsurance} disabled={isCheckingInsurance || !declaredValue || !packageCategory} className="w-full">
                    {isCheckingInsurance && <Loader2 className="mr-2 animate-spin" />}
                    Calculate Premium
                </Button>

                {localInsuranceQuote && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Alert className="mt-4">
                            <Shield className="h-4 w-4"/>
                            <AlertTitle>Insurance Quote</AlertTitle>
                            <AlertDescription>
                                <div className="flex justify-between items-center font-bold">
                                    <span>Premium:</span>
                                    <span>€{localInsuranceQuote.premium.toFixed(2)}</span>
                                </div>
                                <p className="text-xs mt-2">{localInsuranceQuote.riskAnalysis}</p>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setShowInsuranceDialog(false)}>Cancel</Button>
                <Button onClick={handleAddInsurance} disabled={!localInsuranceQuote}>Add to Delivery</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
