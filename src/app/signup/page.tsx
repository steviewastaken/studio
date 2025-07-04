
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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login, loading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // This is a mock signup that just logs the user in
    login();
    toast({
        title: "Account Created!",
        description: "You have been signed in successfully.",
    });
    router.push('/driver');
  }

  return (
    <div className="flex items-center justify-center min-h-screen pt-20">
      <Card className="w-full max-w-md bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>Join Dunlivrer to start shipping with the power of AI.</CardDescription>
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
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Creating Account...' : 'Sign Up'}
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
    </div>
  );
}
