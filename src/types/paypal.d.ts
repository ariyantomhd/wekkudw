// src/types/paypal.d.ts

declare module '@paypal/checkout-server-sdk' {
  export namespace core {
    class PayPalEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    class LiveEnvironment extends PayPalEnvironment {}
    class SandboxEnvironment extends PayPalEnvironment {}
    class PayPalHttpClient {
      constructor(environment: PayPalEnvironment);
      execute(request: unknown): Promise<unknown>;
    }
  }

  export namespace orders {
    class OrdersCreateRequest {
      constructor();
      prefer(prefer: string): void;
      requestBody(order: unknown): void;
    }
    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(capture: unknown): void;
    }
  }
}
