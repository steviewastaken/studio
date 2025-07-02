export interface DeliveryDetails {
  pickupAddress: string;
  destinationAddresses: string[];
  packageSize: 'small' | 'medium' | 'large';
  deliveryType: 'standard' | 'express' | 'night';
}
