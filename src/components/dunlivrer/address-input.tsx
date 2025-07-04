
"use client";

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { loadGoogleMapsApi, apiError as googleApiError } from '@/lib/maps-loader';


type AddressInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

// Define the geographic bounds for Paris
const parisBounds = {
    north: 48.9021,
    south: 48.8156,
    east: 2.4699,
    west: 2.2241,
};


export default function AddressInput({ value, onChange, placeholder, className }: AddressInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    

    useEffect(() => {
        if (status !== 'ready' || !inputRef.current) return;

        if (!autocompleteRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'fr' },
                bounds: parisBounds,
                strictBounds: false, // Bias search to Paris but allow results outside
                fields: ['formatted_address'],
            });
        }

        const listener = autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
                onChange(place.formatted_address);
            }
        });

        return () => {
            window.google.maps.event.removeListener(listener);
        };
    }, [status, onChange]);

    
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

    return (
        <div className="relative w-full">
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={status === 'loading' ? 'Loading Address Search...' : placeholder}
                disabled={status !== 'ready'}
                className={cn(className)}
            />
        </div>
    );
}
