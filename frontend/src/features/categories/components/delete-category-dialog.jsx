"use client";

import { useDeleteCategory } from "../hooks/use-categories";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * DeleteCategoryDialog — confirmation dialog before permanent category deletion.
 *
 * @param {Object} props
 * @param {boolean}  props.open         - Dialog visibility
 * @param {Function} props.onOpenChange - Toggle dialog
 * @param {Object}   props.category     - The category to delete
 */
export function DeleteCategoryDialog({ open, onOpenChange, category }) {
  const deleteMutation = useDeleteCategory({
    onSuccess: () => onOpenChange(false),
  });

  const hasGoals = (category?.goals_count ?? 0) > 0;

  const handleDelete = async () => {
    if (category?.id && !hasGoals) {
      await deleteMutation.mutateAsync(category.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{category?.name}&quot;
              </span>
              ? This action cannot be undone.
            </span>

            {hasGoals && (
              <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  This category is currently linked to {category.goals_count} active{" "}
                  {category.goals_count === 1 ? "goal" : "goals"}. Please reassign or delete
                  those goals first.
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending || hasGoals}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

