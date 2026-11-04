"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema } from "../schemas/category.schema";
import { useCreateCategory, useUpdateCategory } from "../hooks/use-categories";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import ModalHeader from "@/components/ModalHeader";

const PRESET_COLORS = [
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#84CC16", // Lime
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#64748B", // Slate
];

/**
 * CategoryFormDialog — shared create/edit dialog for Categories with full validation.
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {Function} props.onOpenChange - Toggle dialog
 * @param {Object|null} props.category - If provided, the dialog is in edit mode
 */
export function CategoryFormDialog({ open, onOpenChange, category = null }) {
  const isEditing = !!category;

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
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: "#6366F1",
      sort_order: 0,
    },
  });

  const currentColor = watch("color") || "#6366F1";

  // ── Reset form when dialog opens/closes or category changes ─────────────────
  useEffect(() => {
    if (open) {
      reset({
        name: category?.name || "",
        color: category?.color || "#6366F1",
        sort_order: category?.sort_order ?? 0,
      });
    }
  }, [open, category, reset]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createMutation = useCreateCategory({
    onSuccess: () => onOpenChange(false),
  });

  const updateMutation = useUpdateCategory({
    onSuccess: () => onOpenChange(false),
  });

  const mutation = isEditing ? updateMutation : createMutation;

  // ── Submit handler ──────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        color: data.color,
        sort_order: Number(data.sort_order) || 0,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: category.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
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
      <DialogContent className="sm:max-w-[480px]">
        <ModalHeader designation={"Category"} isEditing={isEditing} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* ── Name ──────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="e.g. Health, Work, Personal, Habits"
              {...register("name")}
              aria-invalid={!!errors.name}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* ── Color Picker & Presets ──────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="category-color">Color</Label>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="color"
                  id="category-color-native"
                  value={currentColor.startsWith("#") ? currentColor : "#6366F1"}
                  onChange={(e) =>
                    setValue("color", e.target.value.toUpperCase(), {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border p-0.5 bg-transparent"
                />
              </div>
              <Input
                id="category-color"
                placeholder="#6366F1"
                maxLength={7}
                {...register("color")}
                aria-invalid={!!errors.color}
                className={`font-mono uppercase ${errors.color ? "border-destructive" : ""}`}
              />
            </div>

            {/* Presets palette */}
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((preset) => {
                const isSelected = currentColor.toLowerCase() === preset.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setValue("color", preset, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className={`h-6 w-6 rounded-full transition-transform hover:scale-110 focus:outline-none ${isSelected
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "opacity-80 hover:opacity-100"
                      }`}
                    style={{ backgroundColor: preset }}
                    title={preset}
                    aria-label={`Select color ${preset}`}
                  />
                );
              })}
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          {/* ── Sort Order ─────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="category-sort-order">Sort Order</Label>
            <Input
              id="category-sort-order"
              type="number"
              min="0"
              {...register("sort_order")}
              aria-invalid={!!errors.sort_order}
              className={errors.sort_order ? "border-destructive" : ""}
            />
            {errors.sort_order && (
              <p className="text-sm text-destructive">{errors.sort_order.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in lists and menus.
            </p>
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
              {isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
