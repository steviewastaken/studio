
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, FileText, Layers, Clock, ArrowRight, User, Package, Check, ShieldCheck, Wallet, PackageCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const DetailRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row justify-between py-3 border-b border-white/10 text-sm">
        <dt className="text-muted-foreground md:w-1/3">{label}</dt>
        <dd className="md:w-2/3 font-mono text-white break-words text-left md:text-right flex items-center justify-end gap-2">{children}</dd>
    </div>
);

const TimelineItem = ({ icon, title, description, time, isLast = false }: { icon: React.ReactNode, title: string, description: string, time: string, isLast?: boolean }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary border-2 border-primary/50">
                {icon}
            </div>
            {!isLast && <div className="w-px flex-1 bg-primary/50 my-2"></div>}
        </div>
        <div className="flex-1 pb-8">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-muted-foreground text-sm">{description}</p>
            <p className="text-xs text-muted-foreground/80 mt-1">{time}</p>
        </div>
    </div>
);

const NftCard = () => (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-accent/30">
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <PackageCheck className="text-accent"/>
                Delivery NFT Details
            </CardTitle>
            <CardDescription>
                This digital asset represents the completed delivery.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <dl>
                <DetailRow label="Token ID">
                    <span>12345</span>
                </DetailRow>
                <DetailRow label="Contract Address">
                    <span className="truncate">0xDunL1vr...NFT</span>
                </DetailRow>
                <DetailRow label="Owner (Recipient)">
                    <span className="text-primary truncate">0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B</span>
                </DetailRow>
                 <DetailRow label="Status">
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                        Finalized
                    </Badge>
                </DetailRow>
            </dl>
        </CardContent>
    </Card>
);


export default function TransactionPage({ params }: { params: { txHash: string } }) {
    const { txHash } = params;
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
    }, []);
    
    if (!now) {
        return null; // Or a loading skeleton
    }

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
                <h1 className="text-4xl font-bold font-headline text-white">On-Chain Delivery Record</h1>
                <p className="mt-1 text-lg text-muted-foreground">A permanent, verifiable record of the delivery NFT and its lifecycle.</p>
            </motion.div>

            <motion.div
                className="mt-8 grid gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                           <FileText /> Transaction Summary
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
                             <DetailRow label="Action">
                                <Badge variant="secondary">DELIVERY_NFT_TRANSFER</Badge>
                            </DetailRow>
                             <DetailRow label="Timestamp">
                                <span>{now.toUTCString()}</span>
                            </DetailRow>
                        </dl>
                    </CardContent>
                </Card>

                <NftCard />

                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                           <Layers /> Chain of Custody
                        </CardTitle>
                        <CardDescription>The immutable history of events for Delivery NFT #12345.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div>
                            <TimelineItem 
                                icon={<Package/>} 
                                title="Package Registered & Escrow Funded" 
                                description="Delivery NFT #12345 minted. Payment locked in smart contract."
                                time={new Date(now.getTime() - 9 * 60000).toUTCString()}
                            />
                             <TimelineItem 
                                icon={<User/>} 
                                title="Driver Assigned" 
                                description="Courier 'Alexandre Dubois' accepted the delivery contract."
                                time={new Date(now.getTime() - 8 * 60000).toUTCString()}
                            />
                             <TimelineItem 
                                icon={<Check/>} 
                                title="Pickup Verified" 
                                description="Courier confirmed pickup at Rue de Rivoli, 75001 Paris."
                                time={new Date(now.getTime() - 5 * 60000).toUTCString()}
                            />
                             <TimelineItem 
                                icon={<CheckCircle/>} 
                                title="Delivery Verified & Payment Released" 
                                description="Proof-of-delivery confirmed. Smart contract released funds from escrow to courier."
                                time={now.toUTCString()}
                                isLast
                            />
                        </div>
                    </CardContent>
                </Card>
                
                 <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                           <Wallet /> Smart Contract Payment Flow
                        </CardTitle>
                        <CardDescription>The automated, trustless payment execution for this delivery.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <dl>
                           <DetailRow label="Sender (Customer)">
                                <span className="text-primary truncate">0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B</span>
                            </DetailRow>
                             <DetailRow label="Funds Sent To">
                                <span className="text-accent truncate flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4"/>
                                    Dunlivrer Escrow Contract
                                    <ArrowRight className="w-4 h-4 text-muted-foreground"/>
                                    0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
                                </span>
                            </DetailRow>
                             <DetailRow label="Funds Released To (Courier)">
                                <span className="text-primary truncate">0x32Be343B94f860124dC4fEe278FDCBD38C102D88</span>
                            </DetailRow>
                             <DetailRow label="Value">
                                <span>€12.50</span>
                            </DetailRow>
                        </dl>
                    </CardContent>
                </Card>

            </motion.div>
        </div>
    );
}
