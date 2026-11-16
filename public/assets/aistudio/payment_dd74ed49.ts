// src/types/payment.ts
import { TransactionStatus } from './enums';

export interface CreatePayPalOrderDTO {
  order_id: string; // Mengambil ID mutlak dari tabel orders
}

export interface PayPalOrderResponse {
  order_id: string;
  gateway: 'PAYPAL';
  checkout_url: string; // URL redirect ke halaman persetujuan/login PayPal
  status: string;
}

export interface CapturePayPalOrderDTO {
  order_id: string;
}

// Tambahan tipe data untuk payload pencatatan transaksi ke database/repo
export interface TransactionRecordPayload {
  order_id: string;
  buyer_id: string;
  gateway: 'PAYPAL';
  paypal_transaction_id: string;
  amount: number;
  status: string;
}

export interface TransactionResponse {
  id: string;
  user_id: string;
  order_id: string;
  paypal_transaction_id?: string; // Menyimpan ID Transaksi asli dari PayPal
  gateway: 'PAYPAL';
  amount: number;
  currency: string;
  status: TransactionStatus;
  created_at: string;
}
