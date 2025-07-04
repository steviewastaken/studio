
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';
import { useGoogleMaps } from '@/context/google-maps-context';
import type { DeliveryStatus } from '@/app/tracking/page';

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
  deliveryStatus?: DeliveryStatus;
};

export default function MapComponent({ pickupAddress, destinationAddresses, deliveryStatus = 'IDLE' }: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useGoogleMaps();

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default to Paris
  const [driverPosition, setDriverPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout>();

  const validDestinations = useMemo(() => destinationAddresses.filter(d => d), [destinationAddresses]);
  const hasAddresses = pickupAddress && validDestinations.length > 0;

  const directionsCallback = useCallback((
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === google.maps.DirectionsStatus.OK && result) {
      setDirections(result);
      setError(null);
    } else {
      setDirections(null);
      if (status === 'NOT_FOUND' || status === 'ZERO_RESULTS') {
        setError("Could not find a route for the addresses provided. Please check for typos and ensure they are valid locations.");
      } else {
        setError(`Map service error: ${status}. Please try again later.`);
      }
    }
  }, []);

  useEffect(() => {
    const cleanup = () => {
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = undefined;
        }
    };

    if (deliveryStatus === 'IN_TRANSIT' && directions) {
        const route = directions.routes[0];
        if (!route || !route.overview_path) return;

        const path = route.overview_path;
        const totalSteps = path.length;
        if (totalSteps === 0) return;

        let step = 0;
        const duration = 5000; // 5 seconds for transit animation
        const intervalTime = duration / totalSteps;

        setDriverPosition(path[0].toJSON());

        animationIntervalRef.current = setInterval(() => {
            step++;
            if (step >= totalSteps) {
                cleanup();
                setDriverPosition(path[totalSteps - 1].toJSON());
                return;
            }
            setDriverPosition(path[step].toJSON());
        }, intervalTime);
    } else if (deliveryStatus === 'DELIVERED' && directions) {
        const route = directions.routes[0];
        if (!route || !route.overview_path || route.overview_path.length === 0) return;
        setDriverPosition(route.overview_path[route.overview_path.length - 1].toJSON());
        cleanup();
    } else {
        cleanup();
        setDriverPosition(null);
    }

    return cleanup;
  }, [deliveryStatus, directions]);

  const directionsServiceOptions = useMemo(() => {
      if (!hasAddresses) return null;

      return {
          origin: pickupAddress,
          destination: validDestinations[validDestinations.length - 1],
          waypoints: validDestinations.slice(0, -1).map(addr => ({ location: addr })),
          travelMode: 'DRIVING' as const,
          optimizeWaypoints: true,
      };
  }, [pickupAddress, validDestinations, hasAddresses]);


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
            key={JSON.stringify(destinationAddresses) + pickupAddress}
        >
            {hasAddresses && directionsServiceOptions && !directions && (
                <DirectionsService
                    options={directionsServiceOptions}
                    callback={directionsCallback}
                />
            )}

            {directions && (
                <DirectionsRenderer directions={directions} options={{ suppressMarkers: false, polylineOptions: { strokeColor: 'hsl(var(--primary))', strokeWeight: 5 } }} />
            )}
            
            {driverPosition && (
              <Marker
                  position={driverPosition}
                  icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 7,
                      fillColor: "hsl(var(--primary))",
                      fillOpacity: 1,
                      strokeColor: "white",
                      strokeWeight: 2,
                  }}
                  zIndex={100}
              />
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
