
"use client";

import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';
import { useGoogleMaps } from '@/context/google-maps-context';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
    ],
    disableDefaultUI: true,
    zoomControl: true,
};

type MapComponentProps = {
  pickupAddress: string | null;
  destinationAddresses: string[];
};

export default function MapComponent({ pickupAddress, destinationAddresses }: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useGoogleMaps();

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default to Paris

  const validDestinations = useMemo(() => destinationAddresses.filter(d => d), [destinationAddresses]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    
    // Reset state for new calculations
    setDirections(null);
    setError(null);

    if (!pickupAddress || validDestinations.length === 0) {
      return;
    }

    const origin = pickupAddress;
    const waypoints = validDestinations.slice(0, -1).map(addr => ({ location: addr }));
    const destination = validDestinations[validDestinations.length - 1];

    if (!origin || !destination) {
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypoints,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          setError(null);
        } else {
          console.error(`Error fetching directions: ${status}`);
          setDirections(null);
          if (status === 'NOT_FOUND') {
            setError("Could not find a route for the addresses provided. Please check for typos and ensure they are valid locations.");
          } else {
            setError(`Map error: ${status}. Please try again.`);
          }
        }
      }
    );
  }, [pickupAddress, validDestinations, isLoaded]);

  if (!apiKey) {
    return (
        <div className="p-4 text-center text-sm text-destructive-foreground bg-destructive/80 h-full flex flex-col justify-center items-center">
            <p className="font-bold text-lg">API Key Missing</p>
            <p className="mt-2">Please set the <code className="bg-white/20 px-1 rounded">GEMINI_API_KEY</code> in the <code className="bg-white/20 px-1 rounded">.env</code> file to enable map and AI functionality.</p>
        </div>
    );
  }

  if (loadError) {
    return (
        <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center m-4">
            <AlertTitle className="text-lg font-bold">Map Configuration Error</AlertTitle>
            <AlertDescription className="mt-2">
                <p>The map failed to load. This is usually caused by an API key configuration issue in your Google Cloud project.</p>
                <p className="mt-4 font-semibold">Please ensure the following APIs are enabled for your key:</p>
                <ul className="list-disc list-inside text-left mt-2 space-y-1 mx-auto max-w-sm">
                    <li><strong>Maps JavaScript API</strong> (for displaying the map)</li>
                    <li><strong>Directions API</strong> (for calculating routes)</li>
                    <li><strong>Places API</strong> (for address details)</li>
                </ul>
                <p className="mt-4">You must also have a valid billing account linked to your project.</p>
                <Button asChild variant="link" className="mt-4 text-destructive-foreground hover:text-destructive-foreground/80">
                    <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer">
                        Go to Google Cloud Console <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </AlertDescription>
        </Alert>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div className="relative w-full h-full">
        <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
        >
        {directions && !error && (
            <DirectionsRenderer directions={directions} options={{ suppressMarkers: false, polylineOptions: { strokeColor: 'hsl(var(--primary))', strokeWeight: 5 } }} />
        )}
        </GoogleMap>
        {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <Alert variant="destructive">
                    <AlertTitle>Routing Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        )}
    </div>
  );
}
