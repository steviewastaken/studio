export interface DeliveryDetails {
  pickupAddress: string;
  destinationAddress: string;
  packageSize: 'small' | 'medium' | 'large';
}
