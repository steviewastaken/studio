
"use client";

import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { loadGoogleMapsApi, apiError as googleApiError } from '@/lib/maps-loader';

type MapComponentProps = {
  pickup?: string | null;
  destinations?: string[];
};


export default function MapComponent({ pickup, destinations = [] }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Load API
  useEffect(() => {
    loadGoogleMapsApi()
      .then(() => setStatus('ready'))
      .catch(() => {
        setError(googleApiError);
        setStatus('error');
      });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || map) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 }, // Center on Paris
      zoom: 12,
      mapId: 'DUNLIVRER_MAP_ID',
      disableDefaultUI: true,
      styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
          { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
          { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
          { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
          { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
          { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
      ]
    });
    setMap(newMap);
    
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true, 
        polylineOptions: {
            strokeColor: 'hsl(var(--primary))',
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });

  }, [status, map]);

  // Update Route
  useEffect(() => {
    if (!map || !directionsRendererRef.current) return;
    
    // Clear previous route and markers
    directionsRendererRef.current.setDirections({routes: []});
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const validDestinations = destinations?.filter(d => d && d.trim() !== '') || [];

    if (!pickup || validDestinations.length === 0) {
        map.setCenter({ lat: 48.8566, lng: 2.3522 });
        map.setZoom(12);
        return;
    };

    const directionsService = new google.maps.DirectionsService();

    const waypoints = validDestinations.slice(0, -1).map(d => ({ location: d, stopover: true }));
    const finalDestination = validDestinations[validDestinations.length - 1];

    directionsService.route({
      origin: pickup,
      destination: finalDestination,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK' && result && directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
        
        const pickupIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: 'hsl(var(--primary))',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        };

        const destinationIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: 'hsl(var(--accent))',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        };

        const pickupMarker = new google.maps.Marker({
            position: result.routes[0].legs[0].start_location,
            map: map,
            icon: pickupIcon,
            title: 'Pickup',
        });
        
        const lastLeg = result.routes[0].legs[result.routes[0].legs.length - 1];
        const destMarker = new google.maps.Marker({
            position: lastLeg.end_location,
            map: map,
            icon: destinationIcon,
            title: 'Destination',
        });
        markersRef.current.push(pickupMarker, destMarker);

      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });

  }, [map, pickup, destinations]);

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center w-full h-full bg-destructive/10">
        <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>
                {error}
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
