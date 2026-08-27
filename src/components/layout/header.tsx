"use client";

import { usePathname } from "next/navigation";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout, realm } = useAuth();

  // Simple breadcrumb generator based on pathname
  const generateBreadcrumb = () => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length === 0) return "Dashboard";

    return paths
      .map((path) => path.charAt(0).toUpperCase() + path.slice(1))
      .join(" / ");
  };

  const getInitials = () => {
    if (user?.given_name && user?.family_name) {
      return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
    }
    if (user?.preferred_username) {
      return user.preferred_username.substring(0, 2).toUpperCase();
    }
    return "US";
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border/10 bg-background/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {generateBreadcrumb()}
          </h1>
          {realm && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Espace {realm}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/20 hover:border-primary/50 transition-colors focus:outline-none cursor-pointer">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/20 text-primary font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-card border-border/20" align="end">

            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || user?.preferred_username || "Utilisateur"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/20" />
            <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 text-foreground">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20" />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
