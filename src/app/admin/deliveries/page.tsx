
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const deliveries = [
  { id: 'DNLVR-801', status: 'In Transit', courier: 'Alexandre Dubois', pickup: 'Louvre Museum', destination: 'Eiffel Tower', value: 50 },
  { id: 'DNLVR-802', status: 'Delivered', courier: 'Juliette Moreau', pickup: 'Gare du Nord', destination: 'Montmartre', value: 25 },
  { id: 'DNLVR-803', status: 'Pending', courier: 'N/A', pickup: 'Le Marais', destination: 'Saint-Germain', value: 120 },
  { id: 'DNLVR-804', status: 'In Transit', courier: 'Raphaël Martin', pickup: 'Opéra Garnier', destination: 'La Défense', value: 75 },
  { id: 'DNLVR-805', status: 'Delayed', courier: 'Chloé Bernard', pickup: 'Arc de Triomphe', destination: 'Place des Vosges', value: 30 },
];

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'In Transit': return <Badge className="bg-blue-600">In Transit</Badge>;
        case 'Delivered': return <Badge className="bg-green-600">Delivered</Badge>;
        case 'Pending': return <Badge variant="outline">Pending</Badge>;
        case 'Delayed': return <Badge variant="destructive">Delayed</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
}

export default function DeliveriesPage() {
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
                <h1 className="text-4xl font-bold font-headline text-white">Today's Deliveries</h1>
                <p className="mt-1 text-lg text-muted-foreground">A real-time overview of all ongoing deliveries.</p>
            </motion.div>

            <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle>Delivery Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tracking ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Courier</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deliveries.map(delivery => (
                                    <TableRow key={delivery.id}>
                                        <TableCell className="font-mono text-xs">{delivery.id}</TableCell>
                                        <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                                        <TableCell>{delivery.courier}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{delivery.pickup}</span>
                                                <ArrowLeft className="w-3 h-3 transform rotate-180" />
                                                <span>{delivery.destination}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">€{delivery.value.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
