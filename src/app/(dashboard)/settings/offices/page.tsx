"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Office } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { ModalForm } from "@/components/shared/modal-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "" });
  

  const fetchOffices = async () => {
    try {
      setLoading(true);
      const data = await api.get<Office[]>("/core/offices/");
      setOffices(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les bureaux", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/core/offices/", formData);
      toast({ title: "Succès", description: "Bureau ajouté avec succès" });
      setIsModalOpen(false);
      setFormData({ name: "", location: "" });
      fetchOffices();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'ajouter le bureau", variant: "destructive" });
    }
  };

  const columns = [
    { header: "Nom", accessorKey: "name" },
    { header: "Emplacement", accessorKey: "location" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bureaux</h2>
        <p className="text-muted-foreground">Gérez vos entrepôts et espaces de stockage.</p>
      </div>

      <DataTable
        data={offices}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher un bureau..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Nouveau bureau"
        isLoading={loading}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau bureau"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Emplacement (optionnel)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
