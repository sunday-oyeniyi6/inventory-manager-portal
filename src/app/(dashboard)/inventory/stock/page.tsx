"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { StockItem } from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  

  const fetchStock = async () => {
    try {
      setLoading(true);
      const data = await api.get<StockItem[]>("/inventory/stock-items/");
      setStock(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger le stock", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const columns = [
    { header: "Produit", accessorKey: "product_name" },
    { header: "Bureau", accessorKey: "office_name" },
    { 
      header: "Quantité", 
      accessorKey: "quantity",
      cell: (item: StockItem) => (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-sm px-2">
          {item.quantity}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stock</h2>
        <p className="text-muted-foreground">Consultez l'état de votre stock par produit et bureau.</p>
      </div>

      <DataTable
        data={stock}
        columns={columns}
        searchKey="product_name"
        searchPlaceholder="Rechercher un produit..."
        isLoading={loading}
      />
    </div>
  );
}
