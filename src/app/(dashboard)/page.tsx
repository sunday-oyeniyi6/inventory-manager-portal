"use client";

import { useEffect, useState } from "react";
import { Package, Layers, Bell, ArrowRightLeft, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";
import { api } from "@/lib/api";
import type { Product, StockItem, StockAlert, StockMovement } from "@/types";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
    products: 0,
    totalStock: 0,
    alerts: 0,
    movements: 0,
  });
  
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<StockAlert[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          productsRes,
          stockRes,
          alertsRes,
          movementsRes
        ] = await Promise.all([
          api.get<Product[]>("/catalog/products/"),
          api.get<StockItem[]>("/inventory/stock-items/"),
          api.get<StockAlert[]>("/inventory/alerts/"),
          api.get<StockMovement[]>("/inventory/movements/")
        ]);

        const totalStock = stockRes.reduce(
          (acc, item) => acc + parseFloat(item.quantity), 
          0
        );

        setStats({
          products: productsRes.length,
          totalStock: totalStock,
          alerts: alertsRes.length,
          movements: movementsRes.length, // Simplified: total movements for now
        });

        // Top 5 recent movements (assuming they come sorted, otherwise sort by date)
        const sortedMovements = [...movementsRes].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentMovements(sortedMovements.slice(0, 5));

        // Critical alerts (alerts whose corresponding stock is < min_qty)
        // For MVP, we'll just show the alerts that have been defined
        setCriticalAlerts(alertsRes.slice(0, 5));

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Vue d'ensemble</h2>
        <p className="text-muted-foreground">
          Suivez l'activité de votre inventaire en temps réel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatsCard
          title="Total Produits"
          value={stats.products.toString()}
          icon={<Package className="w-6 h-6" />}
          trend={{ value: 12, label: "vs mois dernier" }}
        />
        <StatsCard
          title="Stock Global"
          value={stats.totalStock.toString()}
          icon={<Layers className="w-6 h-6" />}
          trend={{ value: -2, label: "vs mois dernier" }}
        />
        <StatsCard
          title="Alertes Actives"
          value={stats.alerts.toString()}
          icon={<Bell className="w-6 h-6 text-destructive" />}
        />
        <StatsCard
          title="Mouvements (7j)"
          value={stats.movements.toString()}
          icon={<ArrowRightLeft className="w-6 h-6" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
        {/* Recent Movements */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Mouvements récents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucun mouvement récent.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/10 hover:bg-transparent">
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMovements.map((movement) => (
                      <TableRow key={movement.id} className="border-border/10 hover:bg-white/5">
                        <TableCell className="text-muted-foreground font-medium text-xs">
                          {formatShortDate(movement.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.product_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              movement.movement_type === "IN"
                                ? "bg-success/10 text-success border-success/20"
                                : movement.movement_type === "OUT"
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-info/10 text-info border-info/20"
                            }
                          >
                            {movement.movement_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {movement.movement_type === "IN" ? "+" : movement.movement_type === "OUT" ? "-" : ""}
                          {movement.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Alertes de stock</CardTitle>
          </CardHeader>
          <CardContent>
            {criticalAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucune alerte active. Tout est au vert !
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/10 hover:bg-transparent">
                      <TableHead>Produit</TableHead>
                      <TableHead>Bureau</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalAlerts.map((alert) => (
                      <TableRow key={alert.id} className="border-border/10 hover:bg-white/5">
                        <TableCell className="font-medium">
                          {alert.product_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {alert.office_name}
                        </TableCell>
                        <TableCell className="text-right font-medium text-warning">
                          {alert.minimum_quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
