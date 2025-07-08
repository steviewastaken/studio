
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, FileText, Clock, User, Package, Siren, AlertTriangle, HardHat } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useEffect, useState } from "react";

const DetailRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row justify-between py-3 border-b border-white/10 text-sm">
        <dt className="text-muted-foreground md:w-1/3">{label}</dt>
        <dd className="md:w-2/3 font-mono text-white break-words text-left md:text-right flex items-center justify-end gap-2">{children}</dd>
    </div>
);

const incidentIcons: {[key: string]: React.ReactNode} = {
    'Customer No-Show': <User className="w-5 h-5" />,
    'Vehicle Issue': <Siren className="w-5 h-5" />,
    'Package Damaged': <Package className="w-5 h-5" />,
    'Incorrect Address': <FileText className="w-5 h-5" />,
    'Safety Concern': <AlertTriangle className="w-5 h-5" />,
    'Other': <HardHat className="w-5 h-5" />,
};

const urgencyColors: {[key: string]: string} = {
    'Low': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'High': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Critical': 'bg-red-500/10 text-red-400 border-red-500/20',
};

// Mock data for the incident
const mockIncidentData = {
    incidentType: 'Package Damaged',
    urgency: 'High',
    summary: "The package's corner was crushed upon arrival at the pickup location.",
    courierDescription: "Arrived at the location and found the package was already damaged. Customer was not present. I took a photo of the box before picking it up.",
    photoUrl: 'https://placehold.co/600x400.png',
    entities: {
        trackingId: 'DNLVR-789',
    },
    courier: 'Alexandre Dubois',
}

export default function IncidentDetailsPage({ params }: { params: { incidentId: string } }) {
    const { incidentId } = params;
    const [timestamp, setTimestamp] = useState<string | null>(null);

    useEffect(() => {
      setTimestamp(new Date().toUTCString());
    }, []);
    
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/driver">
                        <ArrowLeft className="mr-2" /> Back to Driver Dashboard
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white">On-Chain Incident Record</h1>
                <p className="mt-1 text-lg text-muted-foreground">An immutable, verifiable record of a reported incident.</p>
            </motion.div>
            
            <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                           <span className="flex items-center gap-3">
                            {incidentIcons[mockIncidentData.incidentType as keyof typeof incidentIcons]}
                            Incident: {mockIncidentData.incidentType}
                           </span>
                           <Badge variant="outline" className={urgencyColors[mockIncidentData.urgency as keyof typeof urgencyColors]}>
                                Urgency: {mockIncidentData.urgency}
                           </Badge>
                        </CardTitle>
                        <CardDescription>Incident ID: {incidentId}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-white">AI Summary</h3>
                            <p className="text-muted-foreground italic">"{mockIncidentData.summary}"</p>
                        </div>

                         {mockIncidentData.photoUrl && (
                            <div>
                                <h3 className="font-semibold text-white mb-2">Photo Evidence</h3>
                                <div className="relative aspect-video w-full max-w-lg rounded-lg overflow-hidden border">
                                    <Image src={mockIncidentData.photoUrl} alt="Incident photo" layout="fill" objectFit="cover" data-ai-hint="damaged box"/>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="font-semibold text-white">Courier's Original Report</h3>
                            <p className="text-muted-foreground p-4 bg-muted rounded-md mt-2 whitespace-pre-wrap">{mockIncidentData.courierDescription}</p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-white mb-2">Record Details</h3>
                            <dl>
                                <DetailRow label="Transaction Hash">
                                    <span className="truncate">0x{incidentId.split('').reverse().join('')}c4d...</span>
                                </DetailRow>
                                <DetailRow label="Status">
                                    <Badge variant="default" className="bg-green-600/80 hover:bg-green-600/90 gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> Verified On-Chain
                                    </Badge>
                                </DetailRow>
                                <DetailRow label="Action">
                                    <Badge variant="secondary">INCIDENT_REPORT_MINTED</Badge>
                                </DetailRow>
                                <DetailRow label="Timestamp">
                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {timestamp}</span>
                                </DetailRow>
                                 <DetailRow label="Reporting Courier">
                                    <span className="flex items-center gap-2"><User className="w-4 h-4" /> {mockIncidentData.courier}</span>
                                </DetailRow>
                                 <DetailRow label="Associated Delivery">
                                    <span>{mockIncidentData.entities.trackingId}</span>
                                </DetailRow>
                            </dl>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
