
"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert, Check, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const initialFraudAlerts = [
  { id: 'FT-9912', userId: 'user-456', accountAge: 3, totalDeliveries: 1, deliveryValue: 150, riskScore: 65, reason: 'New account with high-value item and refund history.', action: 'MANUAL_REVIEW' },
  { id: 'FT-9913', userId: 'user-789', accountAge: 8, totalDeliveries: 0, deliveryValue: 200, riskScore: 70, reason: 'Very new account with high-value item.', action: 'MANUAL_REVIEW' },
  { id: 'FT-9914', userId: 'user-101', accountAge: 250, totalDeliveries: 50, deliveryValue: 550, riskScore: 30, reason: 'Unusual delivery value. Precautionary check.', action: 'MANUAL_REVIEW' },
];

export default function FraudAlertsPage() {
    const [alerts, setAlerts] = useState(initialFraudAlerts);
    const { toast } = useToast();

    const handleAction = (alertId: string, action: 'Allowed' | 'Blocked') => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        toast({
            title: `Transaction ${action}`,
            description: `Alert ${alertId} has been resolved.`,
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white">Fraud Prevention Center</h1>
                <p className="mt-1 text-lg text-muted-foreground">Review and action transactions flagged by our AI.</p>
            </motion.div>

            <div className="mt-8 space-y-6">
                <AnimatePresence>
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                             <motion.div
                                key={alert.id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                            >
                                <Card className="bg-card/80 border-white/10">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-yellow-400" /> Manual Review Required</CardTitle>
                                                <CardDescription>Transaction ID: {alert.id}</CardDescription>
                                            </div>
                                            <Badge variant="destructive" className="bg-destructive/80">Risk: {alert.riskScore}/100</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p><span className="font-semibold">Reason:</span> {alert.reason}</p>
                                        <p><span className="font-semibold">User ID:</span> <span className="font-mono text-xs">{alert.userId}</span></p>
                                        <p><span className="font-semibold">Delivery Value:</span> €{alert.deliveryValue.toFixed(2)}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-4">
                                        <Button variant="outline" onClick={() => handleAction(alert.id, 'Blocked')} className="bg-destructive/20 border-destructive/50 hover:bg-destructive/30 text-destructive-foreground">
                                            <X className="mr-2" /> Block
                                        </Button>
                                         <Button onClick={() => handleAction(alert.id, 'Allowed')} className="bg-green-600 hover:bg-green-700">
                                            <Check className="mr-2" /> Allow
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="text-center p-12 bg-card/50 border-white/10">
                                <Check className="w-12 h-12 mx-auto text-green-500" />
                                <CardTitle className="font-headline text-2xl mt-4">All Clear!</CardTitle>
                                <CardDescription className="mt-2">No pending fraud alerts to review.</CardDescription>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
