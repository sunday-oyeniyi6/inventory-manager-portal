"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Brand } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { ModalForm } from "@/components/shared/modal-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await api.get<Brand[]>("/catalog/brands/");
      setBrands(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les marques", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/catalog/brands/", { name, website });
      toast({ title: "Succès", description: "Marque créée avec succès" });
      setIsModalOpen(false);
      setName("");
      setWebsite("");
      fetchBrands();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de créer la marque", variant: "destructive" });
    }
  };

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Nom", accessorKey: "name" },
    { header: "Slug", accessorKey: "slug" },
    { header: "Site Web", accessorKey: "website" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Marques</h2>
        <p className="text-muted-foreground">Gérez les marques de vos produits.</p>
      </div>

      <DataTable
        data={brands}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher une marque..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Nouvelle marque"
        isLoading={loading}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle marque"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Apple"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site Web (Optionnel)</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Ex: https://www.apple.com"
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
