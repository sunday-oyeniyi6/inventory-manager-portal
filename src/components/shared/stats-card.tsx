import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("glass-card glass-card-hover overflow-hidden relative group", className)}>
      {/* Decorative gradient border top */}
      <div className="absolute top-0 left-0 w-full h-[2px] gradient-primary opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-foreground">
                {value}
              </h3>
            </div>
            
            {description && !trend && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}

            {trend && (
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    trend.value >= 0
                      ? "text-success bg-success/10"
                      : "text-destructive bg-destructive/10"
                  )}
                >
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
