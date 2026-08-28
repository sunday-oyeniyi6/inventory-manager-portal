"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Product, Category, Brand } from "@/types";
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
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    brand: "",
    base_price: "",
    cost_price: "",
    description: "",
    product_type: "STANDARD",
    is_taxable: true,
    is_active: true,
  });
  

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, bRes] = await Promise.all([
        api.get<Product[]>("/catalog/products/"),
        api.get<Category[]>("/catalog/categories/"),
        api.get<Brand[]>("/catalog/brands/"),
      ]);
      setProducts(pRes);
      setCategories(cRes);
      setBrands(bRes);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/catalog/products/", {
        ...formData,
        category: formData.category ? parseInt(formData.category) : null,
        brand: formData.brand ? parseInt(formData.brand) : null,
      });
      toast({ title: "Succès", description: "Produit créé avec succès" });
      setIsModalOpen(false);
      setFormData({ 
        name: "", sku: "", barcode: "", category: "", brand: "", 
        base_price: "", cost_price: "", description: "", 
        product_type: "STANDARD", is_taxable: true, is_active: true 
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de créer le produit", variant: "destructive" });
    }
  };

  const columns = [
    { header: "Nom", accessorKey: "name" },
    { header: "SKU", accessorKey: "sku" },
    { header: "Catégorie", accessorKey: "category_name" },
    { 
      header: "Type", 
      accessorKey: "product_type",
      cell: (item: Product) => (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {item.product_type}
        </Badge>
      )
    },
    { 
      header: "Prix", 
      accessorKey: "base_price",
      cell: (item: Product) => formatCurrency(item.base_price)
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Produits</h2>
        <p className="text-muted-foreground">Gérez votre catalogue de produits.</p>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Rechercher un produit..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Nouveau produit"
        isLoading={loading}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau produit"
        className="sm:max-w-[600px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Référence)</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Code-barres</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_price">Prix de vente</Label>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_price">Prix d'achat</Label>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Type de produit</Label>
            <Select 
              value={formData.product_type} 
              onValueChange={(value) => setFormData({ ...formData, product_type: value ?? formData.product_type })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="SERIALIZED">Sérialisé</SelectItem>
                <SelectItem value="LICENSE">Licence</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value || "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marque</Label>
            <Select 
              value={formData.brand} 
              onValueChange={(value) => setFormData({ ...formData, brand: value || "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="is_taxable" 
              checked={formData.is_taxable}
              onChange={(e) => setFormData({ ...formData, is_taxable: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="is_taxable" className="font-normal cursor-pointer">Soumis à la taxe</Label>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="is_active" 
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">Produit actif</Label>
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
