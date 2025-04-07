import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SocialIcon } from "@/components/ui/social-icon";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ProjectCardProps {
  id: number;
  title: string;
  client: string;
  status: "draft" | "active" | "completed";
  workflowStage: "scenario" | "material" | "publication";
  platforms: string[];
  scenarioStatus: "pending" | "in_review" | "approved" | "rejected";
  materialStatus: "pending" | "in_review" | "approved" | "rejected";
  publicationStatus: "pending" | "published" | "verified";
  deadline?: Date;
  actionRequired?: {
    required: boolean;
    message?: string;
    urgent?: boolean;
  };
  influencers?: { initials: string; name: string }[];
  className?: string;
}

export function ProjectCard({
  id,
  title,
  client,
  status,
  workflowStage,
  platforms,
  scenarioStatus,
  materialStatus,
  publicationStatus,
  deadline,
  actionRequired,
  influencers,
  className,
}: ProjectCardProps) {
  const { t } = useTranslation();

  const getStepStatus = (
    step: "scenario" | "material" | "publication"
  ): "completed" | "current" | "pending" => {
    const stageMap = {
      scenario: 0,
      material: 1,
      publication: 2,
    };
    
    const currentStageIndex = stageMap[workflowStage];
    const stepIndex = stageMap[step];
    
    if (stepIndex < currentStageIndex) return "completed";
    if (stepIndex === currentStageIndex) return "current";
    return "pending";
  };

  const renderInfluencers = () => {
    if (!influencers || influencers.length === 0) return null;
    
    return (
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {influencers.slice(0, 2).map((influencer, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs ring-2 ring-white dark:ring-background"
            >
              {influencer.initials}
            </div>
          ))}
        </div>
        <div className="ml-2 text-xs text-neutral-700 dark:text-neutral-300">
          {t("influencers", { count: influencers.length })}: {influencers.length}
        </div>
      </div>
    );
  };

  const formatDeadline = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  };

  return (
    <Card className={`p-4 relative overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 ${className}`}>
      {actionRequired?.urgent && (
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className="absolute transform rotate-45 bg-warning text-white text-xs font-medium py-1 right-[-40px] top-[20px] w-[170px] text-center">
            {t("urgent")}
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold font-sf-pro">{title}</h3>
          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            {t("client")}: {client}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center space-x-1 mb-3">
        {platforms.map((platform, index) => (
          <SocialIcon
            key={index}
            platform={platform as any}
            size="sm"
            className="mr-1"
          />
        ))}
      </div>

      <ProgressSteps
        className="mb-3"
        steps={[
          { label: "scenario", status: getStepStatus("scenario") },
          { label: "material", status: getStepStatus("material") },
          { label: "publication", status: getStepStatus("publication") },
        ]}
      />

      {actionRequired?.required && (
        <div className="bg-warning/10 p-2 rounded-lg mb-3 text-sm">
          <div className="font-medium text-warning">{t("needs_action")}:</div>
          <div className="text-neutral-800 dark:text-neutral-200">
            {actionRequired.message}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        {renderInfluencers()}
        
        {status === "draft" ? (
          <Button 
            variant="link" 
            className="text-primary text-sm p-0"
            asChild
          >
            <Link to={`/projects/${id}`}>
              {t("launch_project")}
            </Link>
          </Button>
        ) : (
          <>
            {deadline && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("deadline")}: {formatDeadline(deadline)}
              </div>
            )}
            
            <Button 
              variant="link" 
              className="text-primary text-sm p-0 ml-auto"
              asChild
            >
              <Link to={`/projects/${id}`}>
                {t("open")}
              </Link>
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
