
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const couriers = [
  { id: 'C001', name: 'Alexandre Dubois', email: 'alex.d@example.com', status: 'Online', onTimeRate: 98, rating: 4.9, deliveries: 125 },
  { id: 'C002', name: 'Juliette Moreau', email: 'juliette.m@example.com', status: 'Offline', onTimeRate: 95, rating: 4.8, deliveries: 98 },
  { id: 'C003', name: 'Raphaël Martin', email: 'raph.m@example.com', status: 'On Delivery', onTimeRate: 99, rating: 5.0, deliveries: 210 },
  { id: 'C004', name: 'Chloé Bernard', email: 'chloe.b@example.com', status: 'Online', onTimeRate: 92, rating: 4.7, deliveries: 75 },
  { id: 'C005', name: 'Lucas Petit', email: 'lucas.p@example.com', status: 'Offline', onTimeRate: 88, rating: 4.5, deliveries: 50 },
];

export default function CouriersPage() {
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
                <h1 className="text-4xl font-bold font-headline text-white">Courier Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">Monitor and manage your active courier fleet.</p>
            </motion.div>

            <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle>All Couriers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Courier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">On-Time %</TableHead>
                                    <TableHead className="text-center">Rating</TableHead>
                                    <TableHead className="text-right">Deliveries</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {couriers.map(courier => (
                                    <TableRow key={courier.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{courier.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{courier.name}</div>
                                                    <div className="text-sm text-muted-foreground">{courier.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={courier.status === 'Online' ? 'default' : courier.status === 'On Delivery' ? 'secondary' : 'outline'} className={courier.status === 'Online' ? 'bg-green-600' : ''}>
                                                {courier.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">{courier.onTimeRate}%</TableCell>
                                        <TableCell className="text-center font-medium">{courier.rating.toFixed(1)}</TableCell>
                                        <TableCell className="text-right font-medium">{courier.deliveries}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Suspend Courier</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
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
