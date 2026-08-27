import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const toast = ({ title, description, variant }: ToastProps) => {
  if (variant === "destructive") {
    sonnerToast.error(title || "Erreur", { description });
  } else {
    sonnerToast.success(title || "Succès", { description });
  }
};

export function useToast() {
  return { toast };
}
