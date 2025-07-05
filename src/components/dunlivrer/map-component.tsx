
"use client";

import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { loadGoogleMapsApi, apiError as googleApiError } from '@/lib/maps-loader';
import type { DeliveryStatus } from '@/app/tracking/page';

type MapComponentProps = {
  pickup?: string | null;
  destinations?: string[];
  deliveryStatus: DeliveryStatus;
};

const scooterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48px" height="48px" fill="#a855f7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.77 7.23l-1.02-1.02c-.39-.39-1.02-.39-1.41 0L14 9.58V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4.58L4.66 6.21c-.39-.39-1.02-.39-1.41 0l-1.02 1.02c-.39.39-.39 1.02 0 1.41L4.42 11H2v2h3.17L3.41 14.77c-.39.39-.39 1.02 0 1.41l1.02 1.02c.39.39 1.02.39 1.41 0L9 14.83V19c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4.17l3.24 3.24c.39.39 1.02.39 1.41 0l1.02-1.02c.39-.39.39-1.02 0-1.41L19.58 13H22v-2h-2.58l2.25-2.25c.39-.39.39-1.03 0-1.42zM12 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`;


export default function MapComponent({ pickup, destinations = [], deliveryStatus }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  // Storing the DirectionsResult in state to create a stable dependency for the animation effect
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);

  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationFrameId = useRef<number | null>(null);

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
    setDirectionsResult(null); // Clear the stored result
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
        setDirectionsResult(result); // Store result in state
        
        // Add marker for pickup location (A)
        const pickupMarker = new google.maps.Marker({
            position: result.routes[0].legs[0].start_location,
            map: map,
            label: {
                text: 'A',
                color: 'white',
                fontWeight: 'bold'
            },
            title: 'Pickup',
        });
        markersRef.current.push(pickupMarker);

        // Add markers for each destination (B, C, ...)
        result.routes[0].legs.forEach((leg, index) => {
            const destinationMarker = new google.maps.Marker({
                position: leg.end_location,
                map: map,
                label: {
                    text: String.fromCharCode(66 + index), // B, C, D...
                    color: 'white',
                    fontWeight: 'bold'
                },
                title: `Destination ${index + 1}`,
            });
            markersRef.current.push(destinationMarker);
        });

      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });

  }, [map, pickup, destinations]);


  // Driver animation effect
  useEffect(() => {
    if (!map || !window.google.maps.geometry) return;

    const route = directionsResult?.routes?.[0];

    if (deliveryStatus !== 'IN_TRANSIT' || !route?.overview_path) {
      if (driverMarkerRef.current) driverMarkerRef.current.setVisible(false);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        map: map,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(scooterSvg)}`,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
        zIndex: 99
      });
    }

    driverMarkerRef.current.setVisible(true);
    const path = route.overview_path;
    const transitDuration = 5000; // 5 seconds from mock
    const startTime = Date.now();

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / transitDuration, 1);
      
      if (path.length > 1) {
          const index = Math.floor(progress * (path.length - 1));
          const nextIndex = Math.min(index + 1, path.length - 1);
          const segmentProgress = (progress * (path.length - 1)) - index;
          const newPos = window.google.maps.geometry.spherical.interpolate(path[index], path[nextIndex], segmentProgress);
          
          if (driverMarkerRef.current) {
            driverMarkerRef.current.setPosition(newPos);
          }
      }
      
      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [map, deliveryStatus, directionsResult]); // Depend on stable state variable


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
