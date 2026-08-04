"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    color: "#6366F1",
    sort_order: "0"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      color: "#6366F1",
      sort_order: "0"
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      color: cat.color,
      sort_order: cat.sort_order.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    
    try {
      const payload = {
        name: formData.name,
        color: formData.color,
        sort_order: parseInt(formData.sort_order),
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
      } else {
        await api.createCategory(payload);
      }
      
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to save category");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.deleteCategory(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete category (it may be in use)");
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
          <h1 className="text-xl font-bold flex-1">Manage Categories</h1>
          <Button onClick={openNewDialog} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> New Category
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
            No categories found. Create your first one!
          </div>
        ) : (
          <div className="grid gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">Order: {cat.sort_order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
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
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Health"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="w-12 p-1 h-10"
                    value={formData.color} 
                    onChange={e => setFormData({...formData, color: e.target.value})} 
                  />
                  <Input 
                    value={formData.color} 
                    onChange={e => setFormData({...formData, color: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input 
                  type="number" 
                  value={formData.sort_order} 
                  onChange={e => setFormData({...formData, sort_order: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
