
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { handleCorrectAddress } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { loadGoogleMapsApi, apiError as googleApiError } from '@/lib/maps-loader';


type AddressInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};


export default function AddressInput({ value, onChange, placeholder, className }: AddressInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [correctionStatus, setCorrectionStatus] = useState<'idle' | 'correcting' | 'corrected' | 'error'>('idle');
    const [correctionMessage, setCorrectionMessage] = useState('');
    const { toast } = useToast();
    const lastCheckedValue = useRef<string | null>(null);

    useEffect(() => {
        loadGoogleMapsApi()
            .then(() => {
                setStatus('ready');
            })
            .catch(() => {
                setErrorMessage(googleApiError);
                setStatus('error');
            });
    }, []);
    
    const triggerCorrection = useCallback(async (currentValue: string) => {
        // Don't correct empty strings or the exact same value that was just checked
        if (!currentValue || currentValue.trim().length < 5 || currentValue === lastCheckedValue.current) {
            if (currentValue === lastCheckedValue.current) setCorrectionStatus('corrected');
            return;
        }

        setCorrectionStatus('correcting');
        setCorrectionMessage('AI is checking the address...');
        
        const result = await handleCorrectAddress({ address: currentValue });
        lastCheckedValue.current = currentValue; // Mark this value as checked

        if (result.success && result.data) {
            setCorrectionMessage(result.data.reason);
            if (result.data.wasCorrected && result.data.correctedAddress !== currentValue) {
                onChange(result.data.correctedAddress);
                lastCheckedValue.current = result.data.correctedAddress; // The new value is now the last "checked" one
                toast({
                    title: "Address Auto-Corrected",
                    description: `We've updated the address to improve accuracy.`,
                });
            }
            setCorrectionStatus('corrected');
        } else {
            setCorrectionMessage(result.error || 'Could not verify address.');
            setCorrectionStatus('error');
        }
    }, [onChange, toast, lastCheckedValue]);
    
    useEffect(() => {
        if (!value) {
            setCorrectionStatus('idle');
            lastCheckedValue.current = null;
        }
    }, [value]);


    useEffect(() => {
        if (status !== 'ready' || !inputRef.current) return;

        if (!autocompleteRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'fr' },
                fields: ['formatted_address'],
            });
        }

        const listener = autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
                onChange(place.formatted_address);
                // When a Google-validated address is selected, we can immediately mark it as "corrected"
                setCorrectionStatus('corrected');
                setCorrectionMessage('Address validated by Google.');
                lastCheckedValue.current = place.formatted_address;
            }
        });

        return () => {
            window.google.maps.event.removeListener(listener);
        };
    }, [status, onChange]);

    const handleBlur = () => {
        if (value) {
            triggerCorrection(value);
        }
    };
    
    if (status === 'error') {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Map Error</AlertTitle>
                <AlertDescription>
                    {errorMessage || 'Address search is unavailable.'}
                </AlertDescription>
            </Alert>
        )
    }

    const StatusIndicator = () => {
        const icons = {
            correcting: <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />,
            corrected: <CheckCircle2 className="w-4 h-4 text-green-500" />,
            error: <AlertTriangle className="w-4 h-4 text-destructive" />,
        };

        const icon = correctionStatus !== 'idle' ? icons[correctionStatus] : null;

        if (!icon) return null;

        return (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <span className='flex items-center'>{icon}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{correctionMessage}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }

    return (
        <div className="relative w-full">
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                    setCorrectionStatus('idle');
                    onChange(e.target.value);
                }}
                onBlur={handleBlur}
                placeholder={status === 'loading' ? 'Loading Address Search...' : placeholder}
                disabled={status !== 'ready' || correctionStatus === 'correcting'}
                className={cn(className, "pr-10")}
            />
            <StatusIndicator />
        </div>
    );
}
