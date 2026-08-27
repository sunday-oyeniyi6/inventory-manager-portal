"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Tags,
  Briefcase,
  Box,
  Layers,
  ArrowRightLeft,
  Bell,
  Settings,
  Users,
  ChevronLeft,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Catalogue",
      icon: Briefcase,
      children: [
        { title: "Catégories", icon: Tags, href: "/catalog/categories" },
        { title: "Marques", icon: Briefcase, href: "/catalog/brands" },
        { title: "Produits", icon: Box, href: "/catalog/products" },
      ],
    },
    {
      title: "Inventaire",
      icon: Layers,
      children: [
        { title: "Stock", icon: Layers, href: "/inventory/stock" },
        { title: "Mouvements", icon: ArrowRightLeft, href: "/inventory/movements" },
        { title: "Alertes", icon: Bell, href: "/inventory/alerts" },
      ],
    },
    {
      title: "Paramètres",
      icon: Settings,
      children: [
        { title: "Bureaux", icon: Settings, href: "/settings/offices" },
        { title: "Employés", icon: Users, href: "/settings/employees" },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r border-border/10 bg-card/30 backdrop-blur-md transition-all duration-300",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/10">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg gradient-text whitespace-nowrap">
              Inventory
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center animate-fade-in">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          className={cn(
            "text-muted-foreground hover:text-foreground hidden md:flex",
            collapsed && "absolute -right-4 bg-background border rounded-full shadow-md z-10 w-8 h-8 opacity-0 group-hover:opacity-100"
          )}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <nav className="space-y-6">
          {navigation.map((section, i) => (
            <div key={i} className="space-y-2">
              {!collapsed && section.children && (
                <h4 className="px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                  {section.title}
                </h4>
              )}
              
              {section.children ? (
                <div className="space-y-1">
                  {section.children.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive(item.href) ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive(section.href)
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent"
                  )}
                  title={collapsed ? section.title : undefined}
                >
                  <section.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive(section.href) ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {!collapsed && <span>{section.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
