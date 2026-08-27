"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { ModalForm } from "@/components/shared/modal-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get<Category[]>("/catalog/categories/");
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les catégories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/catalog/categories/", { name });
      toast({ title: "Succès", description: "Catégorie créée avec succès" });
      setIsModalOpen(false);
      setName("");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de créer la catégorie", variant: "destructive" });
    }
  };

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Nom", accessorKey: "name" },
    { header: "Slug", accessorKey: "slug" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Catégories</h2>
        <p className="text-muted-foreground">Gérez la classification de vos produits.</p>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher une catégorie..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Nouvelle catégorie"
        isLoading={loading}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle catégorie"
        description="Créez une nouvelle catégorie pour organiser vos produits."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Électronique"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="gradient-primary">
              Enregistrer
            </Button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
}
