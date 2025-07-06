
"use client"

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, User, FileText, Camera } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


const DocumentViewer = ({ documents, driverName }: { documents: any, driverName: string }) => (
    <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>Review Documents for {driverName}</DialogTitle>
            <DialogDescription>Review the submitted documents for verification. Ensure all details are clear and match.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Camera/> Selfie with ID</h3>
                <Image src={documents.selfie} alt="Selfie" width={400} height={300} className="rounded-lg border object-contain" data-ai-hint="person selfie" />
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><FileText/> Driver's License</h3>
                <Image src={documents.license} alt="License" width={400} height={250} className="rounded-lg border object-contain" data-ai-hint="document license" />
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><FileText/> Vehicle Registration</h3>
                <Image src={documents.registration} alt="Registration" width={400} height={500} className="rounded-lg border object-contain" data-ai-hint="document paper" />
            </div>
        </div>
    </DialogContent>
);


export default function KycVerificationPage() {
    const { users, updateUserKycStatus } = useAuth();
    const { toast } = useToast();

    const pendingApplications = users
      .filter(u => u.role === 'driver' && u.kycStatus === 'pending')
      .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          date: new Date().toISOString().split('T')[0],
          documents: {
            selfie: 'https://placehold.co/400x300.png',
            license: 'https://placehold.co/400x250.png',
            registration: 'https://placehold.co/400x500.png',
          }
      }));

    const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
        const newStatus = action === 'Approved' ? 'verified' : 'rejected';
        updateUserKycStatus(id, newStatus);
        toast({
            title: `Application ${action}`,
            description: `The driver's application has been ${action.toLowerCase()}. They will be notified.`,
        });
    };

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
                        <CardTitle>Pending Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <AnimatePresence>
                            {pendingApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Driver</TableHead>
                                            <TableHead>Application Date</TableHead>
                                            <TableHead>Documents</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingApplications.map(app => (
                                             <motion.tr layout key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>{app.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{app.name}</div>
                                                            <div className="text-sm text-muted-foreground">{app.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{app.date}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">View Documents</Button>
                                                        </DialogTrigger>
                                                        <DocumentViewer documents={app.documents} driverName={app.name}/>
                                                    </Dialog>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="icon" className="bg-destructive/20 border-destructive/50 text-destructive-foreground hover:bg-destructive/30" onClick={() => handleAction(app.id, 'Rejected')}>
                                                        <X className="w-4 h-4"/>
                                                    </Button>
                                                    <Button variant="outline" size="icon" className="bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30" onClick={() => handleAction(app.id, 'Approved')}>
                                                        <Check className="w-4 h-4"/>
                                                    </Button>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 text-muted-foreground">
                                    <Check className="w-12 h-12 mx-auto text-green-500" />
                                    <h3 className="mt-4 font-semibold text-white">All applications reviewed!</h3>
                                    <p>There are no pending KYC applications.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
