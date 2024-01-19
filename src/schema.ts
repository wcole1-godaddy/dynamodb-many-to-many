import { z } from "zod";

export const Product = z.object({
  id: z.string(),
  storeId: z.string(),
  name: z.string(),
  categoryIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Product = z.infer<typeof Product>;

export const Category = z.object({
  id: z.string(),
  storeId: z.string(),
  name: z.string(),
  productIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Category = z.infer<typeof Category>;
