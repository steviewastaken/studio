
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, FileText, Layers, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DetailRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row justify-between py-3 border-b border-white/10 text-sm">
        <dt className="text-muted-foreground md:w-1/4">{label}</dt>
        <dd className="md:w-3/4 font-mono text-white break-words text-left md:text-right">{children}</dd>
    </div>
);

export default function TransactionPage({ params }: { params: { txHash: string } }) {
    const { txHash } = params;

    const deliveryData = {
        event: "DELIVERY_COMPLETE",
        pickup: "Rue de Rivoli, 75001 Paris, France",
        destination: "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",
        packageSize: "medium",
        trackingId: "DUN12345XYZ"
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/tracking">
                        <ArrowLeft className="mr-2" /> Back to Tracking
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white">Blockchain Transaction</h1>
                <p className="mt-1 text-lg text-muted-foreground">A permanent, verifiable record of the delivery event.</p>
            </motion.div>

            <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <FileText /> Transaction Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl>
                            <DetailRow label="Transaction Hash">
                                <span>{txHash}</span>
                            </DetailRow>
                             <DetailRow label="Status">
                                <Badge variant="default" className="bg-green-600/80 hover:bg-green-600/90 gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5" /> Success
                                </Badge>
                            </DetailRow>
                             <DetailRow label="Block">
                                <span>8,912,345</span>
                            </DetailRow>
                             <DetailRow label="Timestamp">
                                <span>{new Date().toUTCString()}</span>
                            </DetailRow>
                            <Separator className="my-4" />
                            <DetailRow label="From">
                                <span className="text-primary">0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B</span>
                            </DetailRow>
                             <DetailRow label="To (Dunlivrer Contract)">
                                <span className="text-primary">0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed</span>
                            </DetailRow>
                             <DetailRow label="Value">
                                <span>0 ETH</span>
                            </DetailRow>
                             <DetailRow label="Transaction Fee">
                                <span>0.00123 ETH</span>
                            </DetailRow>
                        </dl>
                    </CardContent>
                </Card>

                <Card className="bg-card/80 border-white/10 mt-8">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                           <Layers /> Decoded Input Data
                        </CardTitle>
                        <CardDescription>The delivery data recorded in this transaction.</CardDescription>
                    </CardHeader>
                     <CardContent className="font-mono text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto">
                        <pre><code>{JSON.stringify(deliveryData, null, 2)}</code></pre>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
