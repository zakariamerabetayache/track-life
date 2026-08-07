"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AddGoalDialog({ open, onOpenChange, weekId, dayOfWeek, existingGoalIds, onGoalAdded }) {
  const [activeTab, setActiveTab] = useState("existing");
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newTimesADay, setNewTimesADay] = useState("1");
  const [selectedPrayerTime, setSelectedPrayerTime] = useState("");
  const prayerTimes = [
    { id: 1, name: "Fajr", time: "04:00 - 06:00" },
    { id: 2, name: "Dhuhr", time: "12:00 - 14:00" },
    { id: 3, name: "Asr", time: "16:00 - 18:00" },
    { id: 4, name: "Maghrib", time: "19:00 - 21:00" },
    { id: 5, name: "Isha", time: "21:00 - 23:00" },
    { id: 6, name: "Witr", time: "23:00 - 04:00" },
  ];

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [goalsRes, catsRes] = await Promise.all([
        api.getGoals({ is_active: true, is_daily: false }),
        api.getCategories()
      ]);
      // Filter out fixed goals and goals already added to this day
      const availableGoals = goalsRes.data.filter(
        g => !g.is_fixed && !existingGoalIds.includes(g.id)
      );
      setGoals(availableGoals);
      setCategories(catsRes.data);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const handleAdd = async () => {
    try {
      setLoading(true);

      const payload = {
        week_id: weekId,
        day_of_week: dayOfWeek,
      };

      payload.prayer_time = selectedPrayerTime || null;

      if (activeTab === "existing") {
        if (!selectedGoalId) return;
        payload.goal_id = parseInt(selectedGoalId);
      } else {
        if (!newTitle.trim()) return;
        payload.new_goal = {
          title: newTitle.trim(),
          category_id: newCategoryId ? parseInt(newCategoryId) : null,
          times_a_day: parseInt(newTimesADay) || 1,
        };
      }

      await api.addDayGoal(payload);

      // Reset form
      setSelectedGoalId("");
      setNewTitle("");
      setNewCategoryId("");
      setNewTimesADay("1");
      setSelectedPrayerTime("");

      if (onGoalAdded) onGoalAdded();
    } catch (error) {
      console.error("Failed to add goal", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Goal to Day</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Select Existing</TabsTrigger>
            <TabsTrigger value="new">Create New</TabsTrigger>
          </TabsList>
          <Select value={selectedPrayerTime} onValueChange={setSelectedPrayerTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select prayer time..." />
            </SelectTrigger>
            <SelectContent>
              {prayerTimes.map(pt => (
                <SelectItem key={pt.id} value={pt.name}>
                  {pt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TabsContent value="existing" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Available Non-Fixed Goals</Label>
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal..." />
                </SelectTrigger>
                <SelectContent>
                  {goals.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">No available goals.</div>
                  ) : (
                    goals.map(g => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                placeholder="e.g., Read 10 pages"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Times a day</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={newTimesADay}
                  onChange={(e) => setNewTimesADay(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={loading || (activeTab === "existing" ? !selectedGoalId : !newTitle.trim())}
          >
            {loading ? "Adding..." : "Add to Day"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
