
"use client";

import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from '../ui/skeleton';
import { locationMap } from '@/lib/locations';

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
  
  if (typeof window !== 'undefined') {
    console.log("Google Maps API Key Loaded:", apiKey ? "Yes" : "No. Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is in your .env file and restart the development server.");
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    libraries: ['places'],
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default to Paris

  const validDestinations = useMemo(() => destinationAddresses.filter(d => d && locationMap.has(d)), [destinationAddresses]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!pickupAddress || validDestinations.length === 0) {
      setDirections(null);
      if (pickupAddress && locationMap.has(pickupAddress)) {
        setCenter(locationMap.get(pickupAddress)!);
      } else {
        setCenter({ lat: 48.8566, lng: 2.3522 });
      }
      return;
    }

    const origin = locationMap.get(pickupAddress);
    // All but the last valid destination are waypoints
    const waypoints = validDestinations.slice(0, -1).map(addr => ({ location: locationMap.get(addr)! }));
    // The last valid destination is the final stop
    const destination = locationMap.get(validDestinations[validDestinations.length - 1]);

    if (!origin || !destination) {
      setDirections(null);
      return;
    }

    setCenter(origin);

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  }, [pickupAddress, validDestinations, isLoaded]);

  if (!apiKey) {
    return (
        <div className="p-4 text-center text-sm text-destructive-foreground bg-destructive/80 h-full flex flex-col justify-center items-center">
            <p className="font-bold text-lg">Google Maps API Key Missing</p>
            <p className="mt-2">Please add your Google Maps API key to the <code className="bg-white/20 px-1 rounded">.env</code> file to enable map functionality.</p>
        </div>
    );
  }

  if (loadError) {
    return (
        <div className="p-4 text-center text-sm text-destructive-foreground bg-destructive/80 h-full flex flex-col justify-center items-center">
            <p className="font-bold text-lg">Map Loading Error</p>
            <p className="mt-2">This is likely due to an incorrect API key or configuration issue in your Google Cloud project.</p>
            <p className="mt-1">Please ensure the Maps JavaScript API is enabled and billing is configured.</p>
        </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={mapOptions}
    >
      {directions ? (
        <DirectionsRenderer directions={directions} options={{ suppressMarkers: false, polylineOptions: { strokeColor: 'hsl(var(--primary))', strokeWeight: 5 } }} />
      ) : (
        <>
          {pickupAddress && locationMap.has(pickupAddress) && (
            <Marker position={locationMap.get(pickupAddress)!} />
          )}
          {validDestinations.map((addr, i) => {
            const pos = locationMap.get(addr);
            return pos ? <Marker key={i} position={pos} /> : null;
          })}
        </>
      )}
    </GoogleMap>
  );
}
