"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { goalFormSchema } from "../schemas/goal.schema";
import { useCreateGoal, useUpdateGoal } from "../hooks/use-goals";
import { api } from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import ModalHeader from "@/components/ModalHeader"

/**
 * GoalFormDialog — shared create/edit dialog for Goals with full validation.
 *
 * Follows the same pattern established in ReminderFormDialog:
 *  - One component for create and edit modes
 *  - React Hook Form + Zod for declarative validation
 *  - Inline error feedback from server responses
 *  - Category integration via TanStack Query
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {Function} props.onOpenChange - Toggle dialog
 * @param {Object|null} props.goal - If provided, the dialog is in edit mode
 */
export function GoalFormDialog({ open, onOpenChange, goal = null }) {
  const isEditing = !!goal;

  // ── Fetch categories for dropdown ──────────────────────────────────────────
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    enabled: open,
  });
  const categories = categoriesResponse?.data || [];

  // ── Form setup ──────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      category_id: "none",
      times_a_day: 1,
      is_fixed: true,
      is_daily: true,
      is_active: true,
      sort_order: 0,
    },
  });

  const isActive = watch("is_active");
  const isFixed = watch("is_fixed");
  const isDaily = watch("is_daily");
  const categoryId = watch("category_id");

  // ── Reset form when dialog opens/closes or goal changes ───────────────────
  useEffect(() => {
    if (open) {
      reset({
        title: goal?.title || "",
        category_id: goal?.category_id != null ? String(goal.category_id) : "none",
        times_a_day: goal?.times_a_day ?? 1,
        is_fixed: goal?.is_fixed ?? true,
        is_daily: goal?.is_daily ?? true,
        is_active: goal?.is_active ?? true,
        sort_order: goal?.sort_order ?? 0,
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
      const payload = {
        title: data.title,
        category_id: data.category_id === "none" ? null : (data.category_id ? Number(data.category_id) : null),
        times_a_day: Number(data.times_a_day) || 1,
        is_fixed: Boolean(data.is_fixed),
        is_daily: Boolean(data.is_daily),
        is_active: Boolean(data.is_active),
        sort_order: Number(data.sort_order) || 0,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: goal.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      // Map server-side field errors back to the form inputs
      if (error?.errors) {
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
        <ModalHeader designation={"Goal"} isEditing={isEditing} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* ── Title ──────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="goal-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="goal-title"
              placeholder="e.g. Morning Workout, Read Quran, Practice Coding"
              {...register("title")}
              aria-invalid={!!errors.title}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* ── Category & Times a Day ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-category">Category</Label>
              <Select
                value={categoryId || "none"}
                onValueChange={(val) => setValue("category_id", val, { shouldDirty: true })}
              >
                <SelectTrigger id="goal-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full inline-block"
                          style={{ backgroundColor: cat.color || "#6366F1" }}
                        />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-times-a-day">Times a day</Label>
              <Input
                id="goal-times-a-day"
                type="number"
                min="1"
                max="20"
                {...register("times_a_day")}
                aria-invalid={!!errors.times_a_day}
                className={errors.times_a_day ? "border-destructive" : ""}
              />
              {errors.times_a_day && (
                <p className="text-sm text-destructive">{errors.times_a_day.message}</p>
              )}
            </div>
          </div>

          {/* ── Checkboxes ─────────────────────────────────────────────────── */}
          <div className="rounded-lg border p-3.5 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="goal-is_active" className="cursor-pointer text-sm font-medium">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Active goals appear in dashboards and daily tracking.
                </p>
              </div>
              <Checkbox
                id="goal-is_active"
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue("is_active", !!checked, { shouldDirty: true })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="goal-is_fixed" className="cursor-pointer text-sm font-medium">
                  Fixed
                </Label>
                <p className="text-xs text-muted-foreground">
                  Fixed goals are automatically included in weekly schedules.
                </p>
              </div>
              <Checkbox
                id="goal-is_fixed"
                checked={isFixed}
                onCheckedChange={(checked) =>
                  setValue("is_fixed", !!checked, { shouldDirty: true })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="goal-is_daily" className="cursor-pointer text-sm font-medium">
                  Daily
                </Label>
                <p className="text-xs text-muted-foreground">
                  Goal is expected to be performed daily rather than occasionally.
                </p>
              </div>
              <Checkbox
                id="goal-is_daily"
                checked={isDaily}
                onCheckedChange={(checked) =>
                  setValue("is_daily", !!checked, { shouldDirty: true })
                }
              />
            </div>
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
              {isEditing ? "Save Changes" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

