// src/types/checkout.ts
import { LicenseType, PaymentGateway } from './enums';

export interface CheckoutItemPayload {
  product_id: string;
  license_type: LicenseType;
  with_support?: boolean;
}

export interface CheckoutRequestPayload {
  items: CheckoutItemPayload[];
  coupon_code?: string | null;
  payment_gateway: PaymentGateway;
  affiliate_token?: string | null;
}
