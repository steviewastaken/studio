
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Euro, Loader2, Send, Percent, Package2, ChevronsUpDown, Check, MapPin, Trash2, PlusCircle, Truck, CheckCircle2 } from 'lucide-react';
import { handleETASubmission, handleFindDriver } from '@/lib/actions';
import type { DeliveryDetails } from './types';
import type { EtaResult } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import type { EstimateETAInput } from '@/ai/flows/estimate-eta';
import type { FindDriverOutput } from '@/ai/flows/find-driver';
import { locations } from '@/lib/locations';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  onNewDelivery: (details: DeliveryDetails, eta: NonNullable<EtaResult>) => void;
  onAddressChange: (addresses: { pickup: string | null; destinations: string[] }) => void;
};

export default function DeliveryForm({ onNewDelivery, onAddressChange }: DeliveryFormProps) {
  const [etaResult, setEtaResult] = useState<EtaResult>(null);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [isFindingDriver, setIsFindingDriver] = useState(false);
  const [driverDetails, setDriverDetails] = useState<FindDriverOutput | null>(null);
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

  const { isSubmitting, isSubmitted } = form.formState;

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
    const subscription = watch(handleAddressChangeCallback);
    return () => subscription.unsubscribe();
  }, [watch, handleAddressChangeCallback]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setEtaResult(null);
    const etaInput: EstimateETAInput = {
      pickupAddress: values.pickupAddress,
      destinationAddresses: values.destinationAddresses.map(d => d.value),
      packageSize: values.packageSize,
      deliveryType: values.deliveryType,
    };

    const result = await handleETASubmission(etaInput);
    if (result.success && result.data) {
      setEtaResult(result.data);
      const deliveryDetails: DeliveryDetails = {
        pickupAddress: values.pickupAddress,
        destinationAddresses: values.destinationAddresses.map(d => d.value),
        packageSize: values.packageSize,
        deliveryType: values.deliveryType
      };
      onNewDelivery(deliveryDetails, result.data);
      toast({
        title: "Quote Ready!",
        description: "Your delivery has been quoted. Review the details below.",
      });

      // Trigger driver search
      setIsFindingDriver(true);
      setDriverDetails(null);
      const driverResult = await handleFindDriver({ pickupAddress: values.pickupAddress });
      if (driverResult.success && driverResult.data) {
        setDriverDetails(driverResult.data);
      } else {
        toast({
          variant: 'destructive',
          title: "Driver Search Failed",
          description: driverResult.error,
        });
        // Let user close the dialog manually if driver not found
      }

    } else {
      toast({
        variant: 'destructive',
        title: "Estimation Failed",
        description: result.error,
      });
    }
  }
  
  const calculateCost = (values: z.infer<typeof formSchema>, eta: EtaResult): number => {
    if (!eta) return 0;

    let totalCost = 0;
    const baseFare = 5.00;
    totalCost += baseFare;
    const estimatedDistance = parseFloat(eta.estimatedTime) * 0.4;
    const extraDistance = Math.max(0, estimatedDistance - 2);

    if (extraDistance > 0) {
        if (estimatedDistance <= 5) {
            totalCost += extraDistance * 1.00;
        } else if (estimatedDistance <= 10) {
            totalCost += (3 * 1.00) + ((estimatedDistance - 5) * 0.80);
        } else if (estimatedDistance <= 20) {
            totalCost += (3 * 1.00) + (5 * 0.80) + ((estimatedDistance - 10) * 0.70);
        } else {
            totalCost += (3 * 1.00) + (5 * 0.80) + (10 * 0.70) + ((estimatedDistance - 20) * 0.60);
        }
    }

    if (values.packageSize === 'medium') {
        totalCost += 1.00;
    } else if (values.packageSize === 'large') {
        totalCost += 2.00;
    }

    if (values.deliveryType === 'express') {
        totalCost += 3.00;
    } else if (values.deliveryType === 'night') {
        totalCost += 2.50;
    }

    if (values.destinationAddresses.length > 1) {
        totalCost *= 0.90;
    }
    
    return totalCost;
  };
  
  const formValues = form.watch();
  const cost = calculateCost(formValues, etaResult);

  const togglePopover = (id: string) => {
    setOpenPopovers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setLocation = (fieldName: "pickupAddress" | `destinationAddresses.${number}.value`, address: string, popoverId: string) => {
    setValue(fieldName, address, { shouldValidate: true, shouldDirty: true });
    togglePopover(popoverId);
  }

  return (
    <>
      <Card className="w-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-3"><Package2 className="text-primary"/>Book a Delivery</CardTitle>
              <CardDescription>Get an instant price and ETA with our AI-powered engine. Add multiple destinations for a smart route.</CardDescription>
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
              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full transition-all duration-300 ease-in-out shadow-lg shadow-primary/20 hover:shadow-primary/40">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isSubmitted ? 'Reschedule with New Quote' : 'Get Quote & Schedule'}
              </Button>
              {etaResult && (
                <Card className="bg-muted/50 dark:bg-muted/20 border-dashed">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Euro className="w-4 h-4" /> Estimated Cost</span>
                      <span className="font-bold text-lg text-primary">€{cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> Estimated Total Time</span>
                      <span className="font-bold">{etaResult.estimatedTime} minutes</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Percent className="w-4 h-4" /> Confidence</span>
                      <span className="font-bold">{(etaResult.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={isFindingDriver} onOpenChange={setIsFindingDriver}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              {driverDetails ? <CheckCircle2 className="text-green-500"/> : <Loader2 className="animate-spin" />}
              {driverDetails ? 'DunGuy Assigned!' : 'Looking for a DunGuy nearby...'}
            </DialogTitle>
            <DialogDescription>
              {driverDetails ? `Your delivery has been assigned. Get ready for pickup!` : `We're searching our network for the nearest available driver to pick up your item.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
              {!driverDetails ? (
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Truck className="w-16 h-16 animate-pulse"/>
                      <p>Scanning for drivers...</p>
                  </div>
              ) : (
                  <div className="flex flex-col items-center gap-4 text-foreground">
                      <div className="p-4 bg-primary/20 rounded-full">
                          <Truck className="w-16 h-16 text-primary"/>
                      </div>
                      <p className="text-lg">
                          <span className="font-bold text-primary">{driverDetails.driverName}</span> is on the way!
                      </p>
                      <div className="text-sm text-muted-foreground">
                          Estimated arrival for pickup: <span className="font-bold text-foreground">{driverDetails.driverEta} minutes</span>.
                      </div>
                  </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
