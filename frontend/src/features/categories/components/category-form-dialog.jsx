export function CategoryFormDialog({ open, onOpenChange, Category = null }) {

    return (

        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <ModalHeader designation={"Category"} isEditing={isEditing} />
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

    )
}
