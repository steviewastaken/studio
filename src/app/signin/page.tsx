
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

function SignInPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await login(values.email, values.password);

    if (!error) {
        toast({
            title: "Signed In!",
            description: "Welcome back!",
        });

        const redirectParam = searchParams.get('redirect');
        
        // This is a simplification. In a real app, you would fetch the user's role
        // and redirect based on that. Since the `login` function in the context
        // now handles the session, the `onAuthStateChange` listener will
        // update the user state, and protected routes will handle redirection.
        // We can just push to a default or the redirect param.
        router.push(redirectParam || '/');

    } else {
        toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: error.message || "Invalid email or password. Please try again.",
        });
    }
  }

  return (
      <Card className="w-full max-w-md bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="demo@dunlivrer.com" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between items-baseline">
                        <FormLabel>Password</FormLabel>
                        <Link href="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
                    </div>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Demo Credentials</AlertTitle>
                <AlertDescription className="text-xs">
                    Use <b>admin@dunlivrer.com</b> or <b>demo@dunlivrer.com</b> with any password.
                </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
                Don't have an account? <Link href="/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
            </p>
        </CardFooter>
      </Card>
  )
}


export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen pt-20">
      <Suspense fallback={
        <Card className="w-full max-w-md h-[550px] flex items-center justify-center bg-card/80 border-white/10">
          <Loader2 className="w-8 h-8 animate-spin"/>
        </Card>
      }>
        <SignInPageContent />
      </Suspense>
    </div>
  );
}
