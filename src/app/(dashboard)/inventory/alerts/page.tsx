"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { StockAlert, Product, Office } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { ModalForm } from "@/components/shared/modal-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    product: "",
    office: "",
    minimum_quantity: "",
  });
  

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const [aRes, pRes, oRes] = await Promise.all([
        api.get<StockAlert[]>("/inventory/alerts/"),
        api.get<Product[]>("/catalog/products/"),
        api.get<Office[]>("/core/offices/"),
      ]);
      setAlerts(aRes);
      setProducts(pRes);
      setOffices(oRes);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les alertes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/inventory/alerts/", {
        ...formData,
        product: parseInt(formData.product),
      });
      toast({ title: "Succès", description: "Alerte configurée avec succès" });
      setIsModalOpen(false);
      setFormData({ product: "", office: "", minimum_quantity: "" });
      fetchAlerts();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de configurer l'alerte", variant: "destructive" });
    }
  };

  const columns = [
    { header: "Produit", accessorKey: "product_name" },
    { header: "Bureau", accessorKey: "office_name" },
    { 
      header: "Quantité minimale", 
      accessorKey: "minimum_quantity",
      cell: (item: StockAlert) => <span className="text-warning font-medium">{item.minimum_quantity}</span>
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Alertes de stock</h2>
        <p className="text-muted-foreground">Configurez des seuils d'alerte pour éviter les ruptures.</p>
      </div>

      <DataTable
        data={alerts}
        columns={columns}
        searchKey="product_name"
        searchPlaceholder="Rechercher par produit..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Nouvelle alerte"
        isLoading={loading}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle alerte"
        className="sm:max-w-[500px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Produit</Label>
            <Select 
              value={formData.product} 
              onValueChange={(value) => setFormData({ ...formData, product: value || "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Bureau</Label>
            <Select 
              value={formData.office} 
              onValueChange={(value) => setFormData({ ...formData, office: value || "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum_quantity">Quantité minimale</Label>
            <Input
              id="minimum_quantity"
              type="number"
              step="0.01"
              value={formData.minimum_quantity}
              onChange={(e) => setFormData({ ...formData, minimum_quantity: e.target.value })}
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
