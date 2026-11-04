import { z } from "zod";

/**
 * Client-side validation schema for the Category form.
 *
 * Mirrors the backend createCategorySchema so users get instant
 * feedback without waiting for a server round-trip.
 *
 * This schema is the SINGLE SOURCE OF TRUTH for form shape —
 * React Hook Form's zodResolver uses it to validate, and
 * z.infer extracts the type.
 */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid 6-digit hex color like #6366F1")
    .default("#6366F1"),

  sort_order: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be at least 0")
    .default(0),
});

