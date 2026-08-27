"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { EmptyState } from "./empty-state";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Rechercher...",
  onAdd,
  addLabel = "Ajouter",
  emptyTitle = "Aucune donnée",
  emptyDescription = "Commencez par ajouter un élément.",
  isLoading = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((item) => {
    if (!searchKey || !searchQuery) return true;
    const value = item[searchKey as keyof T];
    if (typeof value === "string") {
      return value.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {searchKey ? (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/30 border-border/20 focus-visible:ring-primary/50"
            />
          </div>
        ) : (
          <div />
        )}
        
        {onAdd && (
          <Button onClick={onAdd} className="gradient-primary text-white shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/10 overflow-hidden glass-card">
        <Table>
          <TableHeader className="bg-white/5 hover:bg-white/5">
            <TableRow className="border-border/10 hover:bg-transparent">
              {columns.map((column, i) => (
                <TableHead key={i} className="text-muted-foreground font-medium uppercase text-xs tracking-wider">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={onAdd ? { label: addLabel, onClick: onAdd } : undefined}
                    minimal
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, i) => (
                <TableRow 
                  key={i} 
                  className="border-border/10 hover:bg-white/5 transition-colors group"
                >
                  {columns.map((column, j) => (
                    <TableCell key={j} className="py-3">
                      {column.cell
                        ? column.cell(item)
                        : (item[column.accessorKey as keyof T] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
