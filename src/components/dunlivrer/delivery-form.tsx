
"use client";

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Euro, Loader2, Send, Percent, Package2, ChevronsUpDown, Check, MapPin, Trash2, PlusCircle, Zap, Moon } from 'lucide-react';
import { handleETASubmission } from '@/lib/actions';
import type { DeliveryDetails } from './types';
import type { EtaResult } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import type { EstimateETAInput } from '@/ai/flows/estimate-eta';

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

const addresses = [
  { name: 'Louvre <> Champs-Élysées', pickup: '1 Rue de la Légion d\'Honneur, 75007 Paris', destination: '99 Av. des Champs-Élysées, 75008 Paris' },
  { name: 'Gare du Nord <> La Défense', pickup: '18 Rue de Dunkerque, 75010 Paris', destination: '1 Parvis de la Défense, 92800 Puteaux' },
  { name: 'CDG Airport <> Le Marais', pickup: 'Charles de Gaulle Airport, 95700 Roissy-en-France', destination: 'Place des Vosges, 75004 Paris' },
  { name: 'Opéra Garnier <> Montmartre', pickup: 'Place de l\'Opéra, 75009 Paris', destination: 'Place du Tertre, 75018 Paris' },
];

const allAddresses = addresses.flatMap(a => [a.pickup, a.destination]);
const locations = [...new Set(allAddresses)];

type DeliveryFormProps = {
  onNewDelivery: (details: DeliveryDetails, eta: NonNullable<EtaResult>) => void;
  onAddressChange: (addresses: { pickup: string | null; destinations: string[] }) => void;
};

export default function DeliveryForm({ onNewDelivery, onAddressChange }: DeliveryFormProps) {
  const [etaResult, setEtaResult] = useState<EtaResult>(null);
  const [openPopovers, setOpenPopovers] = useState<boolean[]>([]);
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

  const { isSubmitting } = form.formState;

  const watchedPickup = form.watch("pickupAddress");
  const watchedDestinations = form.watch("destinationAddresses");

  useEffect(() => {
    if (onAddressChange) {
      const destinations = watchedDestinations?.map(d => d.value).filter(Boolean) || [];
      onAddressChange({
        pickup: watchedPickup || null,
        destinations: destinations,
      });
    }
  }, [watchedPickup, watchedDestinations, onAddressChange]);

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

    // 1. Base Fare (hardcoded for MVP, e.g., Tier 1 city)
    const baseFare = 5.00;
    totalCost += baseFare;

    // 2. Distance Cost (using ETA as a proxy for distance)
    // Assuming average city speed of 24km/h (0.4 km/min) to convert time to distance
    const estimatedDistance = parseFloat(eta.estimatedTime) * 0.4;
    const extraDistance = Math.max(0, estimatedDistance - 2); // Distance beyond base 2km

    if (extraDistance > 0) {
        if (estimatedDistance <= 5) {
            totalCost += extraDistance * 1.00;
        } else if (estimatedDistance <= 10) {
            const slab1Dist = 3; // 2km to 5km
            const slab2Dist = estimatedDistance - 5;
            totalCost += (slab1Dist * 1.00) + (slab2Dist * 0.80);
        } else if (estimatedDistance <= 20) {
            const slab1Dist = 3;
            const slab2Dist = 5;
            const slab3Dist = estimatedDistance - 10;
            totalCost += (slab1Dist * 1.00) + (slab2Dist * 0.80) + (slab3Dist * 0.70);
        } else {
            const slab1Dist = 3;
            const slab2Dist = 5;
            const slab3Dist = 10;
            const slab4Dist = estimatedDistance - 20;
            totalCost += (slab1Dist * 1.00) + (slab2Dist * 0.80) + (slab3Dist * 0.70) + (slab4Dist * 0.60);
        }
    }

    // 3. Weight Surcharge (mapping package size to weight tiers)
    const { packageSize } = values;
    if (packageSize === 'medium') { // Corresponds to 3-5kg tier
        totalCost += 1.00;
    } else if (packageSize === 'large') { // Corresponds to 5-10kg tier
        totalCost += 2.00;
    }

    // 4. Speed & Time Surcharges
    const { deliveryType } = values;
    if (deliveryType === 'express') {
        totalCost += 3.00;
    } else if (deliveryType === 'night') {
        totalCost += 2.50;
    }

    // 5. Bonus: Multi-Drop Discount
    if (values.destinationAddresses.length > 1) {
        totalCost *= 0.90; // Apply 10% discount
    }
    
    return totalCost;
  };
  
  const formValues = form.watch();
  const cost = calculateCost(formValues, etaResult);

  return (
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
                    <Popover open={openPopovers[-1]} onOpenChange={(isOpen) => setOpenPopovers(p => { const n = [...p]; n[-1] = isOpen; return n;})}>
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
                               {field.value || "Select pickup location..."}
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
                                    key={location}
                                    onClick={() => {
                                        form.setValue("pickupAddress", location)
                                        setOpenPopovers(p => { const n = [...p]; n[-1] = false; return n;});
                                    }}
                                    className="w-full justify-start h-auto py-2 text-left"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            location === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    <span className="whitespace-normal break-words">{location}</span>
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
                {fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`destinationAddresses.${index}.value`}
                        render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                            <Popover open={openPopovers[index]} onOpenChange={(isOpen) => setOpenPopovers(p => { const n = [...p]; n[index] = isOpen; return n;})}>
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
                                    <MapPin className="w-4 h-4 shrink-0 text-accent" />
                                    {field.value || `Destination #${index + 1}`}
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
                                        key={location}
                                        onClick={() => {
                                            form.setValue(`destinationAddresses.${index}.value`, location)
                                            setOpenPopovers(p => { const n = [...p]; n[index] = false; return n;});
                                        }}
                                        className="w-full justify-start h-auto py-2 text-left"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                location === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                        />
                                        <span className="whitespace-normal break-words">{location}</span>
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
                ))}
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
              Get Quote & Schedule
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
  );
}
