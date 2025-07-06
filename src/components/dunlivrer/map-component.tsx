
"use client";

import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { loadGoogleMapsApi, apiError as googleApiError } from '@/lib/maps-loader';

type MapComponentProps = {
  origin?: string | null;
  destination?: string | null;
  waypoints?: string[];
  driverLocation?: { lat: number; lng: number } | null;
  animateDriverPath?: boolean; // For customer-facing simulation
  isNavigating?: boolean;
};

const scooterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48px" height="48px" fill="#a855f7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.77 7.23l-1.02-1.02c-.39-.39-1.02-.39-1.41 0L14 9.58V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4.58L4.66 6.21c-.39-.39-1.02-.39-1.41 0l-1.02 1.02c-.39.39-.39 1.02 0 1.41L4.42 11H2v2h3.17L3.41 14.77c-.39.39-.39 1.02 0 1.41l1.02 1.02c.39.39 1.02.39 1.41 0L9 14.83V19c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4.17l3.24 3.24c.39.39 1.02.39 1.41 0l1.02-1.02c.39-.39.39-1.02 0-1.41L19.58 13H22v-2h-2.58l2.25-2.25c.39-.39.39-1.03 0-1.42zM12 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`;

const driverRealtimeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="#2563eb" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>`;

export default function MapComponent({ origin, destination, waypoints = [], driverLocation, animateDriverPath = false, isNavigating = false }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);

  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const driverRealtimeMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadGoogleMapsApi()
      .then(() => setStatus('ready'))
      .catch(() => {
        setError(googleApiError);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || map) return;
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 12,
      mapId: 'DUNLIVRER_MAP_ID',
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
      styles: [ /* styles remain the same */ ]
    });
    setMap(newMap);
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true,
        suppressPolylines: true, // We will draw our own polyline
    });
  }, [status, map]);

  // Blinking effect for navigation route
  useEffect(() => {
    // Stop any previous interval
    if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
    }

    const polyline = routePolylineRef.current;
    if (isNavigating && polyline) {
        let isVisible = true;
        blinkIntervalRef.current = setInterval(() => {
            isVisible = !isVisible;
            polyline.setVisible(isVisible);
        }, 600);
    } else if (polyline) {
        // If not navigating, ensure the line is visible.
        polyline.setVisible(true);
    }
    
    // Cleanup on unmount or when deps change
    return () => {
        if (blinkIntervalRef.current) {
            clearInterval(blinkIntervalRef.current);
        }
        // On cleanup, ensure polyline is visible again.
        if (polyline) {
            polyline.setVisible(true);
        }
    };
  }, [isNavigating, directionsResult]); // Depends on directionsResult to get the polyline


  useEffect(() => {
    if (!map || !directionsRendererRef.current) return;
    
    // Clear previous state
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
    }
    directionsRendererRef.current.setDirections({routes: []});
    setDirectionsResult(null);

    if (!origin) { // No origin, default view
        map.setCenter({ lat: 48.8566, lng: 2.3522 });
        map.setZoom(12);
        return;
    };
    
    // Only origin is provided, center on it
    if (origin && !destination) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: origin }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
                const marker = new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: map,
                    title: 'Location'
                });
                markersRef.current.push(marker);
            }
        });
        return;
    }

    // Both origin and destination are provided, get route
    if (origin && destination) {
        const directionsService = new window.google.maps.DirectionsService();

        const request: google.maps.DirectionsRequest = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        };
        if (waypoints.length > 0) {
            request.waypoints = waypoints.map(d => ({ location: d, stopover: true }));
        }

        directionsService.route(request, (result, status) => {
          if (status === 'OK' && result && directionsRendererRef.current) {
            // Use renderer to fit map to bounds, but don't draw its line/markers
            directionsRendererRef.current.setDirections(result);
            setDirectionsResult(result);

            // Draw our own polyline
            routePolylineRef.current = new google.maps.Polyline({
                path: result.routes[0].overview_path,
                strokeColor: 'hsl(var(--primary))',
                strokeWeight: 5,
                strokeOpacity: 0.8,
                map: map,
            });
            
            // Draw our own markers
            const pickupMarker = new google.maps.Marker({
                position: result.routes[0].legs[0].start_location,
                map: map,
                label: { text: 'A', color: 'white', fontWeight: 'bold' },
                title: 'Origin',
            });
            markersRef.current.push(pickupMarker);
    
            result.routes[0].legs.forEach((leg, index) => {
                const destinationMarker = new google.maps.Marker({
                    position: leg.end_location,
                    map: map,
                    label: { text: String.fromCharCode(66 + index), color: 'white', fontWeight: 'bold' },
                    title: `Destination ${index + 1}`,
                });
                markersRef.current.push(destinationMarker);
            });
          }
        });
    }
  }, [map, origin, destination, waypoints]);

  // Handle Real-time Driver Location Marker
  useEffect(() => {
    if (!map || !driverLocation) {
        if (driverRealtimeMarkerRef.current) driverRealtimeMarkerRef.current.setVisible(false);
        return;
    }

    if (!driverRealtimeMarkerRef.current) {
        driverRealtimeMarkerRef.current = new window.google.maps.Marker({
            map: map,
            icon: {
                url: `data:image/svg+xml,${encodeURIComponent(driverRealtimeSvg)}`,
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12),
            },
            zIndex: 100
        });
    }

    driverRealtimeMarkerRef.current.setPosition(driverLocation);
    driverRealtimeMarkerRef.current.setVisible(true);
    map.panTo(driverLocation);

  }, [map, driverLocation]);

  // Handle Animated Driver Path (Simulation)
  useEffect(() => {
    if (!map || !window.google.maps.geometry) return;

    const route = directionsResult?.routes?.[0];

    if (!animateDriverPath || !route?.overview_path) {
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
    const transitDuration = 5000; // 5 seconds for simulation
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
  }, [map, animateDriverPath, directionsResult]);


  if (status === 'error') {
    return (
      <div className="flex items-center justify-center w-full h-full bg-destructive/10">
        <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
