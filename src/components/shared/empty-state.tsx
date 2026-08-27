import { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  minimal?: boolean;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  minimal = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 animate-fade-in",
        !minimal && "glass-card min-h-[400px]"
      )}
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gradient-primary text-white">
          {action.label}
        </Button>
      )}
    </div>
  );
}
