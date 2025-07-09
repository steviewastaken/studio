
"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileUp, Loader2, Send } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

// Component to handle file input and preview
const DocumentUploader = ({ id, label, onFileSelect, preview }: { id: string, label: string, onFileSelect: (file: File) => void, preview: string | null }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div 
                className="relative w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors bg-muted/20"
                onClick={() => inputRef.current?.click()}
            >
                <input type="file" id={id} ref={inputRef} className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                {preview ? (
                    <Image src={preview} alt={`${label} preview`} layout="fill" objectFit="contain" className="p-2"/>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileUp className="w-8 h-8"/>
                        <p className="text-sm">Click to upload document</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function KycPage() {
    const { user, updateUserKycStatus, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [selfie, setSelfie] = useState<File | null>(null);
    const [license, setLicense] = useState<File | null>(null);
    const [registration, setRegistration] = useState<File | null>(null);
    
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);
    const [registrationPreview, setRegistrationPreview] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (loading) return; // Wait for auth state to be resolved

        if (!user || user.role !== 'driver') {
            router.push('/signin?redirect=/driver/kyc');
        } else if (user.kycStatus === 'verified' || user.kycStatus === 'pending') {
            router.push('/driver');
        }
    }, [user, loading, router]);


    const handleFileSelect = (file: File, setter: (f: File | null) => void, previewSetter: (s: string | null) => void) => {
        setter(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            previewSetter(reader.result as string);
        }
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!selfie || !license || !registration) {
            toast({ variant: 'destructive', title: 'Missing Documents', description: 'Please upload all required documents.' });
            return;
        }

        setIsLoading(true);
        // Simulate upload and processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        updateUserKycStatus(user.id, 'verified');
        
        setIsLoading(false);
        toast({ title: 'Verification Successful!', description: 'Your account has been auto-approved and is ready to go.' });
        router.push('/driver');
    };

    // Render a loading state or nothing while redirecting or loading auth state
    if (loading || !user || user.role !== 'driver' || user.kycStatus === 'verified' || user.kycStatus === 'pending') {
        return (
          <div className="w-full max-w-2xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
             <Skeleton className="h-12 w-1/2 mx-auto" />
             <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
             <Card className="mt-8 bg-card/80 border-white/10">
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-12 w-full mt-4" />
                </CardContent>
             </Card>
          </div>
        );
    }
    

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold font-headline text-white text-center">Driver Verification (KYC)</h1>
                <p className="mt-1 text-lg text-muted-foreground text-center">To ensure the safety and security of our platform, we need to verify your identity.</p>
            </motion.div>
            <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
                <Card className="bg-card/80 border-white/10">
                    <CardHeader>
                        <CardTitle>Submit Your Documents</CardTitle>
                        <CardDescription>Please upload clear images of the following documents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <DocumentUploader id="selfie" label="Selfie with your ID" onFileSelect={(f) => handleFileSelect(f, setSelfie, setSelfiePreview)} preview={selfiePreview} />
                            <DocumentUploader id="license" label="Driver's License (Front)" onFileSelect={(f) => handleFileSelect(f, setLicense, setLicensePreview)} preview={licensePreview} />
                            <DocumentUploader id="registration" label="Vehicle Registration" onFileSelect={(f) => handleFileSelect(f, setRegistration, setRegistrationPreview)} preview={registrationPreview} />
                            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2"/>}
                                {isLoading ? 'Submitting...' : 'Submit for Verification'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
