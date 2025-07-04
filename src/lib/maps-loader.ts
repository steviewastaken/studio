
import { Loader } from '@googlemaps/js-api-loader';

let apiLoaded: Promise<void> | null = null;
export let apiError: string | null = null;

export function loadGoogleMapsApi() {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY) {
        apiError = "Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY to your .env file.";
        console.error(apiError);
        return Promise.reject(new Error(apiError));
    }

    if (!apiLoaded) {
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY,
            version: 'weekly',
            libraries: ['places', 'marker', 'routes'],
        });

        apiLoaded = new Promise((resolve, reject) => {
            loader.load()
                .then(() => {
                    apiError = null;
                    resolve();
                })
                .catch(e => {
                    console.error("Failed to load Google Maps API", e);
                    apiError = "Could not load Google Maps API. Please check your API key, billing status, and enabled APIs (Maps JavaScript, Places, Geocoding, Directions).";
                    reject(new Error(apiError));
                });
        });
    }
    return apiLoaded;
}
