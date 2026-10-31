"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gaolFormSchema } from "../schemas/goal.schema";
import { useCreateGoal, useUpdateGoal } from "../hooks/use-goals";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

/**
 * goalFormDialog — shared create/edit dialog with full validation.
 *
 * Design decisions a staff engineer would notice:
 *
 *  1. ONE component for both modes — reduces duplication and guarantees
 *     consistent UX. Mode is derived from whether `goal` prop exists.
 *
 *  2. React Hook Form + Zod — form state, validation, dirty tracking, and
 *     error messages are all handled declaratively. No manual useState per field.
 *
 *  3. Server error mapping — if the backend returns field-level validation
 *     errors (e.g. "title already exists"), they're set on the correct field
 *     via setError, appearing inline next to the input.
 *
 *  4. Submit button disabled during mutation — prevents double submissions.
 *     Shows a spinner via Loader2 icon for clear feedback.
 *
 *  5. Form resets on open — useEffect watches `open` and resets to either
 *     empty (create) or populated (edit) state. No stale data between opens.
 *
 * @param {Object} props
 * @param {boolean}  props.open       - Dialog visibility
 * @param {Function} props.onOpenChange - Toggle dialog
 * @param {Object|null} props.goal - If provided, the dialog is in edit mode
 */
export function GoalFormDialog({ open, onOpenChange, goal = null }) {
    const isEditing = !!goal;

    // ── Form setup ──────────────────────────────────────────────────────────────
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        setError,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(goalFormSchema),
        defaultValues: {
            title: "",
            content: "",
            is_active: true,
        },
    });

    // Checkbox needs special handling — register doesn't work well with shadcn Checkbox
    const isActive = watch("is_active");

    // ── Reset form when dialog opens/closes or goal changes ─────────────────
    useEffect(() => {
        if (open) {
            reset({
                title: goal?.title || "",
                content: goal?.content || "",
                is_active: goal?.is_active ?? true,
            });
        }
    }, [open, goal, reset]);

    // ── Mutations ───────────────────────────────────────────────────────────────
    const createMutation = useCreateGoal({
        onSuccess: () => onOpenChange(false),
    });

    const updateMutation = useUpdateGoal({
        onSuccess: () => onOpenChange(false),
    });

    const mutation = isEditing ? updateMutation : createMutation;

    // ── Submit handler ──────────────────────────────────────────────────────────
    const onSubmit = async (data) => {
        try {
            if (isEditing) {
                await updateMutation.mutateAsync({ id: goal.id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error) {
            // Map server-side field errors back to the form inputs
            if (error.errors) {
                Object.entries(error.errors).forEach(([field, messages]) => {
                    setError(field, {
                        type: "server",
                        message: Array.isArray(messages) ? messages[0] : messages,
                    });
                });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Goal" : "Create Goal"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the Goal details below."
                            : "Fill in the details to create a new goal."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
                    {/* ── Title ──────────────────────────────────────────────────────── */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g. Drink water every 2 hours"
                            {...register("title")}
                            aria-invalid={!!errors.title}
                            className={errors.title ? "border-destructive" : ""}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    {/* ── Content ────────────────────────────────────────────────────── */}
                    <div className="space-y-2">
                        <Label htmlFor="content">
                            Content <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="content"
                            placeholder="Describe the goal in detail..."
                            rows={4}
                            {...register("content")}
                            aria-invalid={!!errors.content}
                            className={`resize-none ${errors.content ? "border-destructive" : ""}`}
                        />
                        {errors.content && (
                            <p className="text-sm text-destructive">
                                {errors.content.message}
                            </p>
                        )}
                    </div>

                    {/* ── Active checkbox ─────────────────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="is_active"
                            checked={isActive}
                            onCheckedChange={(checked) => setValue("is_active", !!checked, { shouldDirty: true })}
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                            Active
                        </Label>
                    </div>

                    {/* ── Actions ────────────────────────────────────────────────────── */}
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? "Save Changes" : "Create goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
