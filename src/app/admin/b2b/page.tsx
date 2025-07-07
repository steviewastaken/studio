
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, BarChart, File, Briefcase } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function B2BPage() {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white flex items-center gap-3"><Briefcase/> B2B & Enterprise Suite</h1>
                <p className="mt-1 text-lg text-muted-foreground">Advanced tools for our business clients.</p>
            </motion.div>
            
            <div className="mt-16 border-t border-dashed border-white/20 pt-10">
                 <h2 className="text-2xl font-bold font-headline text-center text-white">Enterprise Tools Coming Soon</h2>
                 <p className="text-center text-muted-foreground mt-2">The Bulk Uploader has been moved to the homepage for all users. More B2B features are on the way.</p>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card/50 border-white/10 border-dashed text-center p-8">
                        <BarChart className="w-10 h-10 mx-auto text-muted-foreground"/>
                        <h3 className="font-semibold mt-4">Analytics Dashboard</h3>
                        <p className="text-xs text-muted-foreground">Visualize your spending and delivery performance.</p>
                    </Card>
                     <Card className="bg-card/50 border-white/10 border-dashed text-center p-8">
                        <File className="w-10 h-10 mx-auto text-muted-foreground"/>
                        <h3 className="font-semibold mt-4">Invoicing & Billing</h3>
                        <p className="text-xs text-muted-foreground">View and manage your monthly invoices.</p>
                    </Card>
                     <Card className="bg-card/50 border-white/10 border-dashed text-center p-8">
                        <BrainCircuit className="w-10 h-10 mx-auto text-muted-foreground"/>
                        <h3 className="font-semibold mt-4">API & Integrations</h3>
                        <p className="text-xs text-muted-foreground">Connect Dunlivrer to your own systems.</p>
                    </Card>
                 </div>
            </div>
        </div>
    );
}
