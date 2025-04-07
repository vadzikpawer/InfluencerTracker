import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type StatusType = 
  | "active" 
  | "draft" 
  | "completed"
  | "scenario"
  | "material"
  | "publication"
  | "pending"
  | "in_review"
  | "approved" 
  | "rejected"
  | "published"
  | "verified"
  | "warning";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const variants: Record<StatusType, string> = {
    active: "bg-primary/10 text-primary",
    draft: "bg-neutral-300/30 text-neutral-700 dark:text-neutral-300",
    completed: "bg-secondary/10 text-secondary",
    scenario: "bg-primary text-white",
    material: "bg-warning text-white",
    publication: "bg-muted text-muted-foreground",
    pending: "bg-muted text-muted-foreground",
    in_review: "bg-warning/10 text-warning",
    approved: "bg-secondary/10 text-secondary",
    rejected: "bg-destructive/10 text-destructive",
    published: "bg-primary/10 text-primary",
    verified: "bg-secondary/10 text-secondary",
    warning: "bg-warning/10 text-warning",
  };

  const displayText = label || t(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full text-xs px-2 py-1 font-medium border-none",
        variants[status],
        className
      )}
    >
      {displayText}
    </Badge>
  );
}
