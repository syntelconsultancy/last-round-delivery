import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  customerId: z.string().uuid(),
  storeId: z.string().uuid(),
  paymentPhone: z.string().regex(/^260[0-9]{9}$/, 'Must be a valid Zambian phone number starting with 260'),
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  landmarkNote: z.string().min(5, 'Please provide a clear landmark note (e.g., near filling station)'),
  items: z.array(
    z.object({
      inventoryId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Cart cannot be empty'),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
