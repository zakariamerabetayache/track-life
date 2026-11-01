import { z } from "zod";

/**
 * Client-side validation schema for the Goal form.
 *
 * Mirrors the backend createGoalSchema so users get instant
 * feedback without waiting for a server round-trip.
 *
 * This schema is the SINGLE SOURCE OF TRUTH for form shape —
 * React Hook Form's zodResolver uses it to validate, and
 * z.infer extracts the type.
 */
export const goalFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title cannot exceed 255 characters"),

  category_id: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (!val || val === "" || val === "none") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),

  times_a_day: z.coerce
    .number()
    .int("Times a day must be a whole number")
    .min(1, "Must be at least 1")
    .max(20, "Cannot exceed 20 times a day")
    .default(1),

  is_fixed: z.boolean().default(true),

  is_daily: z.boolean().default(true),

  is_active: z.boolean().default(true),

  sort_order: z.coerce.number().int().min(0).default(0),
});

