export interface DeliveryDetails {
  pickupAddress: string;
  destinationAddresses: string[];
  packageSize: 'small' | 'medium' | 'large';
  deliveryType: 'standard' | 'express' | 'night';
}

export interface SavedAddress {
    id: string;
    user_id: string;
    label: string;
    address: string;
    created_at: string;
}
