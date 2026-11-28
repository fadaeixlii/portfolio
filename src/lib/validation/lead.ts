import { z } from "zod";
import { locales } from "@/lib/i18n/routing";
import { FREE_PRODUCT_IDS, type FreeProductId } from "@/content/shop";

/** POST /api/shop/lead body. The address is trimmed and lowercased before
 *  the checks, so " Ada@Example.com" and "ada@example.com" are one row. A
 *  paid product is not a valid id here. */
export const leadSchema = z.object({
  productId: z.enum(FREE_PRODUCT_IDS as [FreeProductId, ...FreeProductId[]]),
  email: z.string().trim().toLowerCase().max(254).email(),
  locale: z.enum(locales),
});
