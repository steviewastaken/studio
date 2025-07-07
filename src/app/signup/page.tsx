
"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Suspense } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function SignUpPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const { signup, loading } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await signup(values.name, values.email, values.password);

    if (!error) {
        // The success toast is now handled within the signup function itself
        // to ensure it only shows after all steps are complete.
        router.push('/signin');
    } else {
        toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: error.message,
        });
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">
            Create an Account
        </CardTitle>
        <CardDescription>
            Get started with Dunlivrer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </Button>
          </form>
        </Form>
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>For Testing Purposes</AlertTitle>
            <AlertDescription className="text-xs">
                Use <b>admin@dunlivrer.com</b> for an admin account or <b>driver@dunlivrer.com</b> for a driver account. Any other email will be a customer.
            </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
              Already have an account? <Link href="/signin" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
      </CardFooter>
    </Card>
  )
}

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen pt-20">
      <Suspense fallback={<div className="flex items-center justify-center h-screen w-full">Loading...</div>}>
        <SignUpPageContent />
      </Suspense>
    </div>
  );
}
