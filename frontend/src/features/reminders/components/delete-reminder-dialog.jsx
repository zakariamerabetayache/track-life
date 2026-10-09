"use client";

import { useDeleteReminder } from "../hooks/use-reminders";

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
import { Loader2 } from "lucide-react";

/**
 * DeleteReminderDialog — confirmation dialog before permanent deletion.
 *
 * Why a separate component instead of window.confirm()?
 *  - Consistent with the app's design system (shadcn AlertDialog)
 *  - Shows the reminder title so the user knows exactly what they're deleting
 *  - Disables the delete button during the mutation to prevent double-clicks
 *  - The dialog stays open on failure so the user can retry
 *
 * @param {Object} props
 * @param {boolean}  props.open         - Dialog visibility
 * @param {Function} props.onOpenChange - Toggle dialog
 * @param {Object}   props.reminder     - The reminder to delete
 */
export function DeleteReminderDialog({ open, onOpenChange, reminder }) {
  const deleteMutation = useDeleteReminder({
    onSuccess: () => onOpenChange(false),
  });

  const handleDelete = async () => {
    if (reminder?.id) {
      await deleteMutation.mutateAsync(reminder.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{reminder?.title}&quot;
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
