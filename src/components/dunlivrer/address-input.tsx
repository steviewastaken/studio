
"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

type AddressInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

let apiLoaded: Promise<void> | null = null;
let apiError: string | null = null;

function loadGoogleMapsApi() {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY) {
        apiError = "Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY to your .env file.";
        console.error(apiError);
        return Promise.reject(new Error(apiError));
    }

    if (!apiLoaded) {
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY,
            version: 'weekly',
            libraries: ['places'],
        });

        apiLoaded = new Promise((resolve, reject) => {
            loader.load()
                .then(() => {
                    apiError = null;
                    resolve();
                })
                .catch(e => {
                    console.error("Failed to load Google Maps API", e);
                    apiError = "Could not load Google Maps Places API. Please check your API key and network connection.";
                    reject(new Error(apiError));
                });
        });
    }
    return apiLoaded;
}

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
                setErrorMessage(apiError);
                setStatus('error');
            });
    }, []);

    useEffect(() => {
        if (status !== 'ready' || !inputRef.current) return;

        if (!autocompleteRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'fr' }, // Restrict to France for this app
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
        <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={status === 'loading' ? 'Loading Address Search...' : placeholder}
            disabled={status !== 'ready'}
            className={cn(className)}
        />
    );
}
