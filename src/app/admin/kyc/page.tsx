
"use client"

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function KycVerificationPage() {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/admin"><ArrowLeft className="mr-2" /> Back to Dashboard</Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white">KYC Verification</h1>
                <p className="mt-1 text-lg text-muted-foreground">Review and approve pending driver applications.</p>
            </motion.div>

            <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle>Under Construction</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center p-12 text-muted-foreground">
                        <Construction className="w-12 h-12 mx-auto text-primary" />
                        <h3 className="mt-4 font-semibold text-white">This page is being rebuilt!</h3>
                        <p>We are migrating our KYC system to work with the new Supabase database. This page will be available again soon.</p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
