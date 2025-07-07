
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function SignUpPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, loading } = useAuth();
  
  const isDriverSignup = searchParams.get('as') === 'driver';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const role = isDriverSignup ? 'driver' : 'customer';
    const { error } = await signup(values.name, values.email, values.password, role);

    if (!error) {
        toast({
            title: "Account Created!",
            description: `A confirmation email has been sent. Please verify your email to sign in.`,
        });
        
        // Redirect to a page that tells the user to check their email
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
            {isDriverSignup ? 'Create a Driver Account' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
            {isDriverSignup ? 'Join Dunlivrer to start driving and earning.' : 'Get started with Dunlivrer.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              {loading ? <Loader2 className="animate-spin" /> : (isDriverSignup ? 'Sign Up as a Driver' : 'Sign Up')}
            </Button>
          </form>
        </Form>
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
