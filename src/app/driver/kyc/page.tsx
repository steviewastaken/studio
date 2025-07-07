
"use client";

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KycPage() {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold font-headline text-white text-center">Driver Verification (KYC)</h1>
                <p className="mt-1 text-lg text-muted-foreground text-center">This feature is temporarily under construction.</p>
            </motion.div>
            <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
                <Card className="bg-card/80 border-white/10">
                    <CardHeader className="text-center">
                        <Construction className="w-12 h-12 mx-auto text-primary" />
                        <CardTitle>Page Under Construction</CardTitle>
                        <CardDescription>We're upgrading our systems to connect with a more secure database. The KYC submission form will be back online shortly. Thank you for your patience!</CardDescription>
                    </CardHeader>
                </Card>
            </motion.div>
        </div>
    );
}
