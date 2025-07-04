"use client";

import { Autocomplete } from "@react-google-maps/api";
import { Input, type InputProps } from "@/components/ui/input";
import { useGoogleMaps } from "@/context/google-maps-context";
import { forwardRef, useRef } from "react";

interface Props extends Omit<InputProps, "type"> {
  onPlaceChanged: (place: google.maps.places.PlaceResult) => void;
}

const AddressAutocomplete = forwardRef<HTMLInputElement, Props>(
  ({ onPlaceChanged, ...props }, ref) => {
    const { isLoaded } = useGoogleMaps();
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    if (!isLoaded) {
      return <Input {...props} placeholder="Loading..." disabled type="text" />;
    }

    const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;
    };

    const handlePlaceChanged = () => {
      if (autocompleteRef.current !== null) {
        const place = autocompleteRef.current.getPlace();
        if (place?.formatted_address) {
            onPlaceChanged(place);
        }
      }
    };

    return (
      <Autocomplete
        onLoad={handleLoad}
        onPlaceChanged={handlePlaceChanged}
        options={{
          componentRestrictions: { country: "fr" },
          fields: ["formatted_address", "name", "geometry"],
          types: ["address"],
        }}
      >
        <Input ref={ref} {...props} type="text" />
      </Autocomplete>
    );
  }
);
AddressAutocomplete.displayName = "AddressAutocomplete";
export default AddressAutocomplete;
