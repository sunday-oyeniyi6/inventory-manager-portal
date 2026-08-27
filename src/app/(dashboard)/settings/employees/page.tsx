"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Employee, Role } from "@/types";
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
import { Badge } from "@/components/ui/badge";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role_id: "",
  });
  

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const [eRes, rRes] = await Promise.all([
        api.get<Employee[]>("/core/employees/"),
        api.get<Role[]>("/core/roles/"),
      ]);
      setEmployees(eRes);
      setRoles(rRes);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/core/employees/", {
        ...formData,
        role_id: formData.role_id ? parseInt(formData.role_id) : null,
      });
      toast({ title: "Succès", description: "Employé ajouté avec succès" });
      setIsModalOpen(false);
      setFormData({ username: "", email: "", first_name: "", last_name: "", password: "", role_id: "" });
      fetchEmployees();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'ajouter l'employé", variant: "destructive" });
    }
  };

  const columns = [
    { header: "Nom d'utilisateur", accessorKey: "username" },
    { 
      header: "Nom complet", 
      accessorKey: "name",
      cell: (item: Employee) => `${item.first_name} ${item.last_name}`.trim() || "-"
    },
    { header: "Email", accessorKey: "email" },
    { 
      header: "Rôle", 
      accessorKey: "role",
      cell: (item: Employee) => item.role ? (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {item.role.name}
        </Badge>
      ) : "-"
    },
    { 
      header: "Statut", 
      accessorKey: "is_active",
      cell: (item: Employee) => (
        <Badge
          variant="outline"
          className={
            item.is_active
              ? "bg-success/10 text-success border-success/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }
        >
          {item.is_active ? "Actif" : "Inactif"}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Employés</h2>
        <p className="text-muted-foreground">Gérez l'accès des utilisateurs à votre espace.</p>
      </div>

      <DataTable
        data={employees}
        columns={columns}
        searchKey="username"
        searchPlaceholder="Rechercher par nom d'utilisateur..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Nouvel employé"
        isLoading={loading}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvel employé"
        className="sm:max-w-[600px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="first_name">Prénom</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Nom</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe provisoire</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select 
              value={formData.role_id} 
              onValueChange={(value) => setFormData({ ...formData, role_id: value || "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
