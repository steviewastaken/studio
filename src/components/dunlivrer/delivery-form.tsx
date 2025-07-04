
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Loader2, Send, Package2, Trash2, PlusCircle, Truck, CheckCircle, Euro, Milestone, Timer, ShieldAlert, ShieldQuestion, CheckCircle2, Star, Briefcase, Home } from 'lucide-react';
import { handleFindDriver, handleGetQuote, handleDetectFraud, getSavedAddresses, addSavedAddress } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { FindDriverOutput } from '@/ai/flows/find-driver';
import type { GetQuoteOutput } from '@/ai/flows/get-quote';
import type { DetectFraudOutput, DetectFraudInput } from '@/ai/flows/detect-fraud';
import type { SavedAddress } from './types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import AddressAutocomplete from './address-autocomplete';
import { useAuth } from '@/context/auth-context';
import { Badge } from '../ui/badge';
import { Label } from '@/components/ui/label';
import { useJobs } from '@/context/jobs-context';

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
  quote: GetQuoteOutput | null;
  isReviewed: boolean;
  isGettingQuote: boolean;
  setIsGettingQuote: (loading: boolean) => void;
};

const addressIcons: { [key: string]: React.ReactNode } = {
    'home': <Home className="w-3 h-3" />,
    'work': <Briefcase className="w-3 h-3" />,
    'office': <Briefcase className="w-3 h-3" />,
};

export default function DeliveryForm({ onAddressChange, onQuoteChange, quote, isReviewed, isGettingQuote, setIsGettingQuote }: DeliveryFormProps) {
  const { user } = useAuth();
  const { addJob } = useJobs();
  const [isFindingDriver, setIsFindingDriver] = useState(false);
  const [driverDetails, setDriverDetails] = useState<FindDriverOutput | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [isCheckingFraud, setIsCheckingFraud] = useState(false);
  const [fraudResult, setFraudResult] = useState<DetectFraudOutput | null>(null);
  const [showFraudDialog, setShowFraudDialog] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [addressToSave, setAddressToSave] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  const { watch, setValue, trigger } = form;

  const fetchSavedAddresses = useCallback(async () => {
    if (!user) return;
    const result = await getSavedAddresses();
    if (result.success && result.data) {
        setSavedAddresses(result.data);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedAddresses();
  }, [fetchSavedAddresses]);

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

    const result = await handleGetQuote({
        pickupAddress: values.pickupAddress,
        destinationAddresses: values.destinationAddresses.map(d => d.value),
        packageSize: values.packageSize,
        deliveryType: values.deliveryType,
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

    setIsGettingQuote(false);
  }

  const findDriver = async (pickupAddress: string): Promise<boolean> => {
    setIsFindingDriver(true);
    setDriverDetails(null);
    const driverResult = await handleFindDriver({ pickupAddress });
    if (driverResult.success && driverResult.data) {
        setDriverDetails(driverResult.data);
        setIsFindingDriver(false);
        return true;
    } else {
        toast({
            variant: 'destructive',
            title: "Driver Search Failed",
            description: driverResult.error,
        });
        setIsFindingDriver(false);
        return false;
    }
  };

  const resetFormState = () => {
    setDriverDetails(null);
    onQuoteChange(null);
    form.reset();
  }

  const handleConfirmDispatch = async () => {
    const values = form.getValues();
    if (!values.pickupAddress) {
        toast({
            variant: 'destructive',
            title: "Missing Pickup Address",
            description: 'Please select a pickup address before scheduling.',
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
        const driverFound = await findDriver(values.pickupAddress);
        if (driverFound && quote) {
             const newJob = {
                id: `job-${Date.now()}`,
                pickup: values.pickupAddress,
                dropoff: values.destinationAddresses[values.destinationAddresses.length - 1].value,
                distance: quote.distance,
                payout: (quote.price * 0.8).toFixed(2),
                time: quote.eta,
            };
            addJob(newJob);
            toast({
                title: "Delivery Dispatched!",
                description: "Nearby DunGuys have been notified of the new job."
            });
        }
    }
  };
  
  const handleProceedAnyway = async () => {
      setShowFraudDialog(false);
      const values = form.getValues();
      const driverFound = await findDriver(values.pickupAddress);
      if (driverFound && quote) {
          const newJob = {
              id: `job-${Date.now()}`,
              pickup: values.pickupAddress,
              dropoff: values.destinationAddresses[values.destinationAddresses.length - 1].value,
              distance: quote.distance,
              payout: (quote.price * 0.8).toFixed(2),
              time: quote.eta,
          };
          addJob(newJob);
          toast({
              title: "Delivery Dispatched!",
              description: "Nearby DunGuys have been notified of the new job."
          });
      }
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
  
  const handleOpenSaveDialog = (address: string) => {
    setAddressToSave(address);
    setIsSaveDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!newLabel.trim() || !addressToSave) return;
    setIsSaving(true);
    const result = await addSavedAddress(addressToSave, newLabel);
    if (result.success) {
        toast({
            title: "Address Saved!",
            description: `Saved "${addressToSave}" as "${newLabel}".`
        });
        setIsSaveDialogOpen(false);
        setNewLabel("");
        setAddressToSave(null);
        fetchSavedAddresses();
    } else {
        toast({
            variant: 'destructive',
            title: "Failed to Save",
            description: result.error,
        });
    }
    setIsSaving(false);
  }

  const handleSelectSavedAddress = (fieldName: 'pickupAddress' | `destinationAddresses.${number}.value`, address: string) => {
    setValue(fieldName, address, { shouldValidate: true, shouldDirty: true });
  };
    
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 9;
    return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
  });

  const isDispatchLoading = isCheckingFraud || isFindingDriver;

  const renderAddressField = (field: any, fieldName: 'pickupAddress' | `destinationAddresses.${number}.value`, placeholder: string, label: string) => {
      const fieldValue = watch(fieldName);
      const isAlreadySaved = savedAddresses.some(addr => addr.address === fieldValue);
      
      return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <AddressAutocomplete
                    {...field}
                    placeholder={placeholder}
                    onPlaceChanged={(place) => {
                        if (place.formatted_address) {
                            setValue(fieldName, place.formatted_address, { shouldValidate: true, shouldDirty: true });
                        }
                    }}
                />
            </FormControl>
            <div className="flex flex-wrap items-center gap-2 min-h-[26px]">
                {fieldValue && user && !isAlreadySaved && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-0.5 px-2 text-primary hover:bg-primary/10"
                        onClick={() => handleOpenSaveDialog(fieldValue)}
                    >
                        <Star className="w-3 h-3 mr-1.5"/> Save for later
                    </Button>
                )}
                 {user && (
                    <>
                        {savedAddresses.map(addr => (
                            <Badge key={addr.id} variant="outline" className="cursor-pointer hover:border-primary/80 hover:bg-primary/10" onClick={() => handleSelectSavedAddress(fieldName, addr.address)}>
                                {addressIcons[addr.label.toLowerCase()] || <Star className="w-3 h-3"/>}
                                <span className="ml-1.5">{addr.label}</span>
                            </Badge>
                        ))}
                    </>
                )}
            </div>
            <FormMessage/>
        </FormItem>
      )
  };

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
                  render={({ field }) => renderAddressField(field, 'pickupAddress', 'Enter pickup address...', 'Pickup Location')}
              />

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative">
                        <FormField
                            control={form.control}
                            name={`destinationAddresses.${index}.value`}
                            render={({ field: renderField }) => renderAddressField(renderField, `destinationAddresses.${index}.value`, `Destination #${index + 1}`, `Destination ${index + 1}`)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button type="button" variant="outline" size="lg" onClick={handleScheduleForLater}>
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule for Later
                        </Button>
                        <Button type="button" onClick={handleConfirmDispatch} size="lg" disabled={isDispatchLoading}>
                            {isCheckingFraud && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isFindingDriver && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isDispatchLoading && <Truck className="mr-2 h-4 w-4" />}
                            {isCheckingFraud ? 'Analyzing Risk...' : isFindingDriver ? 'Finding Driver...' : 'Dispatch Now'}
                        </Button>
                    </div>
                </div>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={!!driverDetails} onOpenChange={(open) => !open && setDriverDetails(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <CheckCircle2 className="text-green-500"/>
              DunGuy Assigned!
            </DialogTitle>
            <DialogDescription>
              Your delivery has been assigned. Get ready for pickup!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
              <div className="flex flex-col items-center gap-4 text-foreground">
                  <div className="p-4 bg-primary/20 rounded-full">
                      <Truck className="w-16 h-16 text-primary"/>
                  </div>
                  <p className="text-lg">
                      <span className="font-bold text-primary">{driverDetails?.driverName}</span> is on the way!
                  </p>
                  <div className="text-sm text-muted-foreground">
                      Estimated arrival for pickup: <span className="font-bold text-foreground">{driverDetails?.driverEta}</span>.
                  </div>
              </div>
          </div>
          <DialogFooter>
            <Button onClick={() => resetFormState()}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
      
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Save Address</DialogTitle>
                  <DialogDescription>
                      Give this address a short label (e.g., Home, Work, Gym) for easy access next time.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="address-to-save">Address</Label>
                    <Input id="address-to-save" value={addressToSave || ""} readOnly disabled />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="address-label">Label</Label>
                    <Input id="address-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g., Home" />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveAddress} disabled={isSaving || !newLabel.trim()}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Address
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
    </>
  );
}
