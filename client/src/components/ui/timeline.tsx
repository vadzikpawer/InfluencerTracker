import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TimelineItem {
  title: string;
  description?: string;
  date: Date | string;
  status: "completed" | "active" | "pending";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  const { t } = useTranslation();
  
  const getStatusColor = (status: "completed" | "active" | "pending") => {
    switch (status) {
      case "completed":
        return "bg-secondary";
      case "active":
        return "bg-primary";
      case "pending":
        return "bg-neutral-200 dark:bg-neutral-800";
    }
  };
  
  const formatDate = (date: Date | string) => {
    if (typeof date === "string") return date;
    return format(date, "dd.MM.yyyy, HH:mm", { locale: ru });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex">
          <div className="flex flex-col items-center mr-3">
            <div className={cn("w-4 h-4 rounded-full", getStatusColor(item.status))}></div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-full bg-neutral-200 dark:bg-neutral-800"></div>
            )}
          </div>
          <div>
            <div className={cn(
              "font-medium",
              item.status === "pending" && "text-neutral-500 dark:text-neutral-400"
            )}>
              {t(item.title)}
            </div>
            {item.description && (
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                {item.description}
              </div>
            )}
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatDate(item.date)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
