
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Loader2, Send, Package2, ChevronsUpDown, Check, MapPin, Trash2, PlusCircle, Truck, CheckCircle2, DollarSign, Milestone, Timer } from 'lucide-react';
import { handleFindDriver, handleGetQuote } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import type { FindDriverOutput } from '@/ai/flows/find-driver';
import type { GetQuoteOutput } from '@/ai/flows/get-quote';
import { locations } from '@/lib/locations';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

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
};

export default function DeliveryForm({ onAddressChange }: DeliveryFormProps) {
  const [isReviewed, setIsReviewed] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [isFindingDriver, setIsFindingDriver] = useState(false);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [quote, setQuote] = useState<GetQuoteOutput | null>(null);
  const [driverDetails, setDriverDetails] = useState<FindDriverOutput | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('');
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

  const { watch, setValue } = form;

  const handleAddressChangeCallback = useCallback((value: z.infer<typeof formSchema>) => {
    const { pickupAddress, destinationAddresses } = value;
    const destinations = destinationAddresses?.map(d => d.value).filter(Boolean) || [];
    onAddressChange({
      pickup: pickupAddress || null,
      destinations: destinations,
    });
  }, [onAddressChange]);

  useEffect(() => {
    const subscription = watch((value) => {
        handleAddressChangeCallback(value as z.infer<typeof formSchema>);
        setIsReviewed(false);
        setQuote(null);
    });
    return () => subscription.unsubscribe();
  }, [watch, handleAddressChangeCallback]);


  async function onGetQuote(values: z.infer<typeof formSchema>) {
    setIsGettingQuote(true);
    setQuote(null);

    const result = await handleGetQuote({
        pickupAddress: values.pickupAddress,
        destinationAddresses: values.destinationAddresses.map(d => d.value),
        packageSize: values.packageSize,
        deliveryType: values.deliveryType,
    });
    
    if (result.success && result.data) {
        setQuote(result.data);
        setIsReviewed(true);
        toast({
            title: "Quote Generated!",
            description: "Review your quote below and proceed to dispatch.",
        });
    } else {
        toast({
            variant: 'destructive',
            title: "Quotation Failed",
            description: result.error,
        });
    }

    setIsGettingQuote(false);
  }

  const handleConfirmDispatch = async () => {
    const pickupAddress = form.getValues('pickupAddress');
    if (!pickupAddress) {
        toast({
            variant: 'destructive',
            title: "Missing Pickup Address",
            description: 'Please select a pickup address before scheduling.',
        });
        return;
    }

    setIsFindingDriver(true);
    setDriverDetails(null);
    const driverResult = await handleFindDriver({ pickupAddress });
    if (driverResult.success && driverResult.data) {
        setDriverDetails(driverResult.data);
    } else {
        toast({
            variant: 'destructive',
            title: "Driver Search Failed",
            description: driverResult.error,
        });
    }
    setIsFindingDriver(false);
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
    setDriverDetails(null); // Reset driver details
    setIsReviewed(false); // Reset form state
    setQuote(null);
    form.reset();
    toast({
      title: 'Delivery Scheduled!',
      description: `Your delivery is scheduled for ${format(scheduledDate, 'PPP')} between ${scheduledTime}.`,
    });
  };
  
  const togglePopover = (id: string) => {
    setOpenPopovers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setLocation = (fieldName: "pickupAddress" | `destinationAddresses.${number}.value`, address: string, popoverId: string) => {
    setValue(fieldName, address, { shouldValidate: true, shouldDirty: true });
    togglePopover(popoverId);
  }
  
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 9;
    return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
  });

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
                    <FormItem className="flex flex-col">
                      <FormLabel>Pickup Address</FormLabel>
                      <Popover open={openPopovers['pickup']} onOpenChange={() => togglePopover('pickup')}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between h-12 text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span className="truncate">{locations.find(l => l.address === field.value)?.name || "Select pickup location..."}</span>
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <ScrollArea className="h-64">
                              {locations.map((location) => (
                                <Button
                                      variant="ghost"
                                      key={location.address}
                                      onClick={() => setLocation("pickupAddress", location.address, 'pickup')}
                                      className="w-full justify-start h-auto py-2 text-left"
                                  >
                                      <Check className={cn("mr-2 h-4 w-4 shrink-0", location.address === field.value ? "opacity-100" : "opacity-0")} />
                                      <span className="whitespace-normal break-words">{location.name}</span>
                                  </Button>
                              ))}
                            </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormLabel>Destination Addresses</FormLabel>
                  {fields.map((field, index) => {
                      const popoverId = `dest-${index}`;
                      return (
                          <FormField
                              key={field.id}
                              control={form.control}
                              name={`destinationAddresses.${index}.value`}
                              render={({ field: renderField }) => (
                              <FormItem className="flex items-center gap-2">
                                  <Popover open={openPopovers[popoverId]} onOpenChange={() => togglePopover(popoverId)}>
                                  <PopoverTrigger asChild>
                                      <FormControl>
                                      <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn("w-full justify-between h-12 text-sm", !renderField.value && "text-muted-foreground")}
                                      >
                                          <div className="flex items-center gap-2 truncate">
                                          <MapPin className="w-4 h-4 shrink-0 text-accent" />
                                          <span className="truncate">{locations.find(l => l.address === renderField.value)?.name || `Destination #${index + 1}`}</span>
                                          </div>
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                      </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                      <ScrollArea className="h-64">
                                          {locations.map((location) => (
                                          <Button
                                              variant="ghost"
                                              key={location.address}
                                              onClick={() => setLocation(`destinationAddresses.${index}.value`, location.address, popoverId)}
                                              className="w-full justify-start h-auto py-2 text-left"
                                          >
                                              <Check className={cn("mr-2 h-4 w-4 shrink-0", location.address === renderField.value ? "opacity-100" : "opacity-0")} />
                                              <span className="whitespace-normal break-words">{location.name}</span>
                                          </Button>
                                          ))}
                                      </ScrollArea>
                                  </PopoverContent>
                                  </Popover>
                                  {fields.length > 1 && (
                                      <Button variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0">
                                          <Trash2 className="w-4 h-4 text-destructive"/>
                                      </Button>
                                  )}
                              </FormItem>
                              )}
                          />
                      );
                  })}
                  <FormMessage>{form.formState.errors.destinationAddresses?.root?.message}</FormMessage>
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <DollarSign className="mx-auto text-primary h-6 w-6 mb-2"/>
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="font-bold text-lg">${quote.price.toFixed(2)}</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <Milestone className="mx-auto text-primary h-6 w-6 mb-2"/>
                                <p className="text-xs text-muted-foreground">Distance</p>
                                <p className="font-bold text-lg">{quote.distance}</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <Timer className="mx-auto text-primary h-6 w-6 mb-2"/>
                                <p className="text-xs text-muted-foreground">ETA</p>
                                <p className="font-bold text-lg">{quote.eta}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <Button type="button" variant="outline" size="lg" onClick={handleScheduleForLater}>
                                <Clock className="mr-2 h-4 w-4" />
                                Schedule for Later
                            </Button>
                            <Button type="button" onClick={handleConfirmDispatch} size="lg">
                                {isFindingDriver ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                                {isFindingDriver ? 'Finding Driver...' : 'Dispatch Now'}
                            </Button>
                        </div>
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
                      Estimated arrival for pickup: <span className="font-bold text-foreground">{driverDetails?.driverEta} minutes</span>.
                  </div>
              </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setDriverDetails(null); setIsReviewed(false); form.reset(); }}>Close</Button>
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
    </>
  );
}
