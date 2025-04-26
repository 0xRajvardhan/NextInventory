// zod/customValidators.ts
import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Custom reusable phone number schema
export const phoneNumberSchema = z.string().refine((value) => isValidPhoneNumber(value), {
  message: 'Invalid phone number',
});
