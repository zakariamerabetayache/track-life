import { z } from "zod";

/**
 * Client-side validation schema for the Reminder form.
 *
 * Mirrors the backend createReminderSchema so users get instant
 * feedback without waiting for a server round-trip.
 *
 * This schema is the SINGLE SOURCE OF TRUTH for form shape —
 * React Hook Form's zodResolver uses it to validate, and
 * z.infer extracts the type (useful if you add TypeScript later).
 */
export const goalFormSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(255, "Title cannot exceed 255 characters"),




    is_active: z.boolean().default(true),
});
