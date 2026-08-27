"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { StockMovement, Product, Office } from "@/types";
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
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    product: "",
    office: "",
    movement_type: "IN",
    quantity: "",
    reference: "",
    notes: "",
  });
  

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const [mRes, pRes, oRes] = await Promise.all([
        api.get<StockMovement[]>("/inventory/movements/"),
        api.get<Product[]>("/catalog/products/"),
        api.get<Office[]>("/core/offices/"),
      ]);
      setMovements(mRes);
      setProducts(pRes);
      setOffices(oRes);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/inventory/movements/", {
        ...formData,
        product: parseInt(formData.product),
      });
      toast({ title: "Succès", description: "Mouvement enregistré avec succès" });
      setIsModalOpen(false);
      setFormData({ product: "", office: "", movement_type: "IN", quantity: "", reference: "", notes: "" });
      fetchMovements();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer le mouvement", variant: "destructive" });
    }
  };

  const columns = [
    { 
      header: "Date", 
      accessorKey: "date",
      cell: (item: StockMovement) => formatShortDate(item.date)
    },
    { header: "Produit", accessorKey: "product_name" },
    { header: "Bureau", accessorKey: "office_name" },
    { 
      header: "Type", 
      accessorKey: "movement_type",
      cell: (item: StockMovement) => (
        <Badge
          variant="outline"
          className={
            item.movement_type === "IN"
              ? "bg-success/10 text-success border-success/20"
              : item.movement_type === "OUT"
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-info/10 text-info border-info/20"
          }
        >
          {item.movement_type}
        </Badge>
      )
    },
    { 
      header: "Qté", 
      accessorKey: "quantity",
      cell: (item: StockMovement) => (
        <span className="font-medium">
          {item.movement_type === "IN" ? "+" : item.movement_type === "OUT" ? "-" : ""}{item.quantity}
        </span>
      )
    },
    { header: "Ref", accessorKey: "reference" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mouvements de stock</h2>
        <p className="text-muted-foreground">Enregistrez les entrées, sorties et ajustements.</p>
      </div>

      <DataTable
        data={movements}
        columns={columns}
        searchKey="product_name"
        searchPlaceholder="Rechercher par produit..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Nouveau mouvement"
        isLoading={loading}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau mouvement"
        className="sm:max-w-[600px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
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
          
          <div className="space-y-2 col-span-2">
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
            <Label>Type de mouvement</Label>
            <Select 
              value={formData.movement_type} 
              onValueChange={(value) => setFormData({ ...formData, movement_type: value || "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrée (IN)</SelectItem>
                <SelectItem value="OUT">Sortie (OUT)</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajustement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="reference">Référence (optionnel)</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="N° de facture, BL..."
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-4">
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
