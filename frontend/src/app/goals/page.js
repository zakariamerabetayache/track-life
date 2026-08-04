"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    is_fixed: true,
    times_a_day: "1",
    sort_order: "0"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, catsRes] = await Promise.all([
        api.getGoals({ is_active: true, is_daily: true }),
        api.getCategories()
      ]);
      setGoals(goalsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingGoal(null);
    setFormData({
      title: "",
      category_id: "",
      is_fixed: true,
      times_a_day: "1",
      sort_order: "0"
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      category_id: goal.category_id ? goal.category_id.toString() : "",
      is_fixed: goal.is_fixed,
      times_a_day: goal.times_a_day.toString(),
      sort_order: goal.sort_order.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) return;

    try {
      const payload = {
        title: formData.title,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        is_fixed: formData.is_fixed,
        times_a_day: parseInt(formData.times_a_day),
        sort_order: parseInt(formData.sort_order),
      };

      if (editingGoal) {
        await api.updateGoal(editingGoal.id, payload);
      } else {
        await api.createGoal(payload);
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to save goal");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to disable this goal?")) return;
    try {
      await api.deleteGoal(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete goal");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 p-4 sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex-1">Manage Goals</h1>
          <Button onClick={openNewDialog} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
            No goals found. Create your first one!
          </div>
        ) : (
          <div className="grid gap-3">
            {goals.map(goal => (
              <div key={goal.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                <div>
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {goal.category && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: goal.category.color }} />
                        {goal.category.name}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      {goal.is_fixed ? "Fixed (Auto)" : "Non-Fixed (Manual)"}
                    </span>
                    <span>{goal.times_a_day}x per day</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Read 10 pages"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category_id} onValueChange={val => setFormData({ ...formData, category_id: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="is_fixed"
                checked={formData.is_fixed}
                onCheckedChange={checked => setFormData({ ...formData, is_fixed: checked })}
              />
              <Label htmlFor="is_fixed" className="font-normal">
                <strong>Fixed Goal:</strong> Automatically add this to every day of the week.
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Times a day</Label>
                <Input
                  type="number" min="1"
                  value={formData.times_a_day}
                  onChange={e => setFormData({ ...formData, times_a_day: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
