"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { publicApiFetch } from "@/lib/api";
import { deriveRealmName } from "@/lib/keycloak";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, ArrowRight, Loader2 } from "lucide-react";
import type { PublicTenant } from "@/types";

export default function LoginPage() {
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName.trim()) {
      setError("Veuillez saisir le nom de votre entreprise");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Fetch public tenant list to verify the company exists
      const tenants = await publicApiFetch<PublicTenant[]>(
        "/core/tenants/public/"
      );

      const matchedTenant = tenants.find(
        (t) => t.name.toLowerCase() === companyName.trim().toLowerCase()
      );

      if (!matchedTenant) {
        setError(
          "Entreprise introuvable. Vérifiez le nom et réessayez."
        );
        setIsLoading(false);
        return;
      }

      // 2. Derive the Keycloak realm name from the tenant name
      const realmName = deriveRealmName(matchedTenant.name);

      // 3. Redirect to Keycloak for authentication
      await login(realmName);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Erreur de connexion. Vérifiez que le serveur est accessible."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="login-bg" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 animate-float">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">
            Inventory Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestion intelligente de votre inventaire
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>
              Entrez le nom de votre entreprise pour vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nom de l&apos;entreprise</Label>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Ex: Vision Tech"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                  className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 animate-fade-in">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-white font-medium text-base hover:opacity-90 transition-opacity cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Propulsé par TechXAF — Inventory Manager v1.0
        </p>
      </div>
    </div>
  );
}
