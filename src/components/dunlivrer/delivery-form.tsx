"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, DollarSign, Loader2, Send, BookMarked, Percent } from 'lucide-react';
import { handleETASubmission } from '@/lib/actions';
import type { DeliveryDetails } from './types';
import type { EtaResult } from '@/app/page';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  pickupAddress: z.string().min(5, "Please enter a valid address."),
  destinationAddress: z.string().min(5, "Please enter a valid address."),
  packageSize: z.enum(['small', 'medium', 'large']),
});

const addresses = [
  { name: 'Home <> Office', pickup: '123 Main St, Anytown, USA', destination: '456 Business Ave, Anytown, USA' },
  { name: 'Warehouse <> Downtown', pickup: '789 Industrial Rd, Anytown, USA', destination: '101 City Center, Anytown, USA' },
  { name: 'Airport <> Hotel', pickup: 'Anytown International Airport', destination: 'Grand Hotel Anytown' },
];

const packageCosts = { small: 5, medium: 10, large: 15 };

type DeliveryFormProps = {
  onNewDelivery: (details: DeliveryDetails, eta: NonNullable<EtaResult>) => void;
};

export default function DeliveryForm({ onNewDelivery }: DeliveryFormProps) {
  const [etaResult, setEtaResult] = useState<EtaResult>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickupAddress: "",
      destinationAddress: "",
      packageSize: "medium",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setEtaResult(null);
    const result = await handleETASubmission(values);
    if (result.success && result.data) {
      setEtaResult(result.data);
      onNewDelivery(values, result.data);
      toast({
        title: "ETA Estimated!",
        description: "Your new delivery has been scheduled.",
      });
    } else {
      toast({
        variant: 'destructive',
        title: "Estimation Failed",
        description: result.error,
      });
    }
  }

  const handleAddressSelect = (value: string) => {
    const selected = addresses.find(a => a.name === value);
    if (selected) {
      form.setValue('pickupAddress', selected.pickup);
      form.setValue('destinationAddress', selected.destination);
    }
  };
  
  const selectedPackageSize = form.watch('packageSize');
  const cost = packageCosts[selectedPackageSize] + (etaResult ? parseFloat(etaResult.estimatedTime) * 0.25 : 0);

  return (
    <Card className="w-full shadow-lg rounded-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">New Delivery</CardTitle>
            <CardDescription>Enter details to get an ETA and cost estimate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
               <Select onValueChange={handleAddressSelect}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Load from Address Book" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {addresses.map(addr => (
                    <SelectItem key={addr.name} value={addr.name}>{addr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 456 Oak Ave" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="packageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full transition-all duration-300 ease-in-out">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Estimate & Schedule
            </Button>
            {etaResult && (
              <Card className="bg-muted/50 dark:bg-muted/20 border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><DollarSign className="w-4 h-4" /> Estimated Cost</span>
                    <span className="font-bold text-lg text-primary">${cost.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> Estimated Time</span>
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
