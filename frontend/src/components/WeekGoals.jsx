"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Check, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function WeekGoals({ weekId }) {
    const [formData, setFormData] = useState({
        designation: "",
        order: 1,
    });
    const [addGoalState, setAddGoalState] = useState(false)
    const [weekGoals, setWeekGoals] = useState([])

    useEffect(() => {
        if (weekId) {
            getWeekGoals();
        }
    }, [weekId]);

    async function getWeekGoals() {
        try {
            const response = await fetch(`http://localhost:3001/api/week-goals?week_id=${weekId}`)
            const result = await response.json()
            if (result.success) {
                setWeekGoals(result.data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function addWeekGoals() {
        if (!formData.designation.trim()) return;
        try {
            const response = await fetch("http://localhost:3001/api/week-goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    week_id: weekId,
                    designation: formData.designation,
                    order: Number(formData.order) || 1,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setWeekGoals(prev => [...prev, result.data]);
                setFormData({ designation: "", order: 1 });
                setAddGoalState(false);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function toggleCheck(goal) {
        // Optimistic update
        const updatedStatus = !goal.is_checked;
        setWeekGoals(prev => prev.map(g => g.id === goal.id ? { ...g, is_checked: updatedStatus } : g));

        try {
            const response = await fetch(`http://localhost:3001/api/week-goals/${goal.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_checked: updatedStatus })
            });
            const result = await response.json();
            if (!result.success) {
                // Revert if failed
                setWeekGoals(prev => prev.map(g => g.id === goal.id ? { ...g, is_checked: !updatedStatus } : g));
            }
        } catch (error) {
            console.error(error);
            // Revert if failed
            setWeekGoals(prev => prev.map(g => g.id === goal.id ? { ...g, is_checked: !updatedStatus } : g));
        }
    }

    async function removeWeekGoal(id) {
        setWeekGoals(prev => prev.filter(g => g.id !== id));
        try {
            const response = await fetch(`http://localhost:3001/api/week-goals/${id}`, { method: "DELETE" });
            const result = await response.json();
            if (!result.success) {
                getWeekGoals(); // Re-fetch on error to sync state
            }
        } catch (error) {
            console.error(error);
            getWeekGoals(); // Re-fetch on error to sync state
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow mb-8 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b bg-muted/20">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Focus of the Week</h2>
                    <p className="text-sm text-muted-foreground mt-1">Set broad goals to evaluate at the end of the week.</p>
                </div>
                <Button
                    onClick={() => setAddGoalState(prev => !prev)}
                    size="sm"
                    variant={addGoalState ? "secondary" : "default"}
                    className="flex items-center gap-2"
                >
                    {addGoalState ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {addGoalState ? "Cancel" : "Add Goal"}
                </Button>
            </div>

            <div className="p-6 space-y-4">
                {addGoalState && (
                    <div className="bg-muted/30 p-4 rounded-lg border space-y-4 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    placeholder="What do you want to achieve this week?"
                                    className="bg-background"
                                    autoFocus
                                />
                            </div>
                            <div className="w-24 space-y-2">
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: e.target.value })}
                                    placeholder="Order"
                                    className="bg-background"
                                />
                            </div>
                        </div>
                        <Button onClick={addWeekGoals} className="w-full">
                            <Check className="h-4 w-4 mr-2" />
                            Save Weekly Goal
                        </Button>
                    </div>
                )}

                {weekGoals.length === 0 && !addGoalState ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No goals set for this week yet.</p>
                        <Button 
                            variant="link" 
                            onClick={() => setAddGoalState(true)}
                            className="mt-2 text-primary"
                        >
                            Set your first goal
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {weekGoals.map(item => (
                            <div 
                                key={item.id} 
                                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                    item.is_checked 
                                        ? "bg-muted/30 border-muted" 
                                        : "bg-background hover:border-primary/30"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Checkbox 
                                        id={`week-goal-${item.id}`}
                                        checked={item.is_checked}
                                        onCheckedChange={() => toggleCheck(item)}
                                        className="h-5 w-5 rounded-md"
                                    />
                                    <label 
                                        htmlFor={`week-goal-${item.id}`}
                                        className={`font-medium cursor-pointer transition-colors ${
                                            item.is_checked 
                                                ? "text-muted-foreground line-through" 
                                                : "text-foreground"
                                        }`}
                                    >
                                        {item.designation}
                                    </label>
                                </div>
                                
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeWeekGoal(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}