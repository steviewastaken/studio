
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
import { Info } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, setLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const loggedInUser = await login(values.email, values.password);

    if (loggedInUser) {
        toast({
            title: "Signed In!",
            description: "Welcome back!",
        });

        const redirectParam = searchParams.get('redirect');
        let defaultPath: string;

        switch (loggedInUser.role) {
            case 'admin':
                defaultPath = '/admin';
                break;
            case 'driver':
                defaultPath = '/driver';
                break;
            default: // customer
                defaultPath = '/';
                break;
        }

        // A valid redirect should exist and not be an admin page for non-admins
        const isValidRedirect = redirectParam && (loggedInUser.role === 'admin' || !redirectParam.startsWith('/admin'));

        router.push(isValidRedirect ? redirectParam : defaultPath);

    } else {
        toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: "Invalid email or password. Please try again.",
        });
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen pt-20">
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Demo Credentials</AlertTitle>
                <AlertDescription className="text-xs">
                    Use <b>admin@dunlivrer.com</b> / <b>admin</b> for admin access, or <b>demo@dunlivrer.com</b> / <b>demo</b> for driver access.
                </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
                Don't have an account? <Link href="/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
