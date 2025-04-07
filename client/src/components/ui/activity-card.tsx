import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Image, 
  Video,
  Share2, 
  Plus
} from "lucide-react";

interface ActivityUser {
  id: number;
  name: string;
  role: string;
}

interface ActivityProject {
  id: number;
  title: string;
  client: string;
}

interface Activity {
  id: number;
  activityType: string;
  description: string;
  createdAt: string | Date;
  user?: ActivityUser | null;
  project?: ActivityProject | null;
}

interface ActivityCardProps {
  activity: Activity;
  className?: string;
}

export function ActivityCard({ activity, className }: ActivityCardProps) {
  const { t } = useTranslation();
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scenario_approved":
      case "scenario_updated":
        return <FileText className="h-4 w-4" />;
      case "scenario_rejected":
        return <AlertCircle className="h-4 w-4" />;
      case "material_submitted":
      case "material_approved":
        return <Image className="h-4 w-4" />;
      case "material_rejected":
        return <AlertCircle className="h-4 w-4" />;
      case "publication_published":
      case "publication_verified":
        return <Share2 className="h-4 w-4" />;
      case "project_created":
        return <Plus className="h-4 w-4" />;
      case "project_completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const getActivityColor = (type: string) => {
    if (type.includes("approved") || type.includes("completed") || type.includes("verified")) {
      return "bg-secondary/10 text-secondary";
    }
    if (type.includes("rejected")) {
      return "bg-warning/10 text-warning";
    }
    if (type.includes("created") || type.includes("updated") || type.includes("published")) {
      return "bg-primary/10 text-primary";
    }
    return "bg-neutral-200/50 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  };
  
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ru });
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-start">
        <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.activityType)} flex items-center justify-center mr-3 flex-shrink-0`}>
          {getActivityIcon(activity.activityType)}
        </div>
        
        <div className="flex-grow">
          <div className="font-medium">{t(activity.activityType)}</div>
          
          {activity.project && (
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              {activity.project.title} - {activity.project.client}
            </div>
          )}
          
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {formatTime(activity.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
