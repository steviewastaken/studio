
import { Loader } from '@googlemaps/js-api-loader';

let apiLoaded: Promise<void> | null = null;
export let apiError: string | null = null;

export function loadGoogleMapsApi() {
    console.log(">>> [maps-loader.ts] loadGoogleMapsApi called.");

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY) {
        apiError = "Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY to your .env file.";
        console.error(`>>> [maps-loader.ts] ${apiError}`);
        return Promise.reject(new Error(apiError));
    }

    if (!apiLoaded) {
        console.log(">>> [maps-loader.ts] Initializing Google Maps API loader for the first time.");
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY,
            version: 'weekly',
            libraries: ['places', 'marker', 'routes', 'geometry'],
        });

        apiLoaded = new Promise((resolve, reject) => {
            loader.load()
                .then(() => {
                    console.log(">>> [maps-loader.ts] Google Maps API loaded successfully.");
                    apiError = null;
                    resolve();
                })
                .catch(e => {
                    console.error(">>> [maps-loader.ts] Failed to load Google Maps API", e);
                    apiError = "Could not load Google Maps API. Please check your API key, billing status, and enabled APIs (Maps JavaScript, Places, Geocoding, Directions).";
                    reject(new Error(apiError));
                });
        });
    } else {
      console.log(">>> [maps-loader.ts] Google Maps API already loading or loaded.");
    }
    return apiLoaded;
}
