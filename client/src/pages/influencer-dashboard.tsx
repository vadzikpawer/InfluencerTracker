import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/project-card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function InfluencerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats/influencer"],
    enabled: !!user && user.role === "influencer",
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });
  
  // Filter projects that require action
  const actionRequiredProjects = projects?.filter(project => {
    // This is a simplified check; in a real app, we would check the project-influencer relationship status
    return project.status === "active" && 
      (project.workflowStage === "scenario" || project.workflowStage === "material");
  }).slice(0, 2);

  const formatDeadline = (date: string) => {
    if (!date) return '';
    return format(new Date(date), 'dd.MM.yyyy', { locale: ru });
  };

  const renderStatCards = () => {
    if (isLoadingStats) {
      return Array(4).fill(0).map((_, i) => (
        <Card key={i} className="bg-white dark:bg-neutral-900/30">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ));
    }

    if (!stats) return null;

    return (
      <>
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60 mb-1">{t("active_projects")}</div>
            <div className="text-2xl font-bold font-sf-pro">{stats.activeProjects}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60 mb-1">{t("needs_action")}</div>
            <div className="text-2xl font-bold font-sf-pro text-warning">{stats.needsAction}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60 mb-1">{t("completed_this_month")}</div>
            <div className="text-2xl font-bold font-sf-pro">{stats.completedProjects}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60 mb-1">{t("earned_this_month")}</div>
            <div className="text-2xl font-bold font-sf-pro">
              {stats.monthlyIncome?.toLocaleString()} ₽
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderActionRequiredProjects = () => {
    if (isLoadingProjects) {
      return Array(2).fill(0).map((_, i) => (
        <Card key={i} className="bg-white dark:bg-neutral-900/30">
          <CardContent className="p-4">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-1 w-full mb-1" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ));
    }

    if (!actionRequiredProjects || actionRequiredProjects.length === 0) {
      return (
        <div className="col-span-full p-6 text-center text-neutral-500 dark:text-neutral-400">
          {t("no_actions_required")}
        </div>
      );
    }

    return actionRequiredProjects.map((project) => (
      <ProjectCard
        key={project.id}
        id={project.id}
        title={project.title}
        client={project.client}
        status={project.status}
        workflowStage={project.workflowStage}
        platforms={project.platforms || []}
        scenarioStatus={project.workflowStage === "scenario" ? "in_review" : "approved"}
        materialStatus={project.workflowStage === "material" ? "pending" : "pending"}
        publicationStatus="pending"
        deadline={project.deadline ? new Date(project.deadline) : undefined}
        actionRequired={{
          required: true,
          message: project.workflowStage === "scenario" 
            ? t("check_scenario_feedback") 
            : t("upload_material"),
          urgent: project.deadline && new Date(project.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 // 3 days
        }}
      />
    ));
  };

  const renderAllProjects = () => {
    if (isLoadingProjects) {
      return Array(5).fill(0).map((_, i) => (
        <div key={i} className="p-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
              <Skeleton className="h-5 w-60 mb-2 md:mb-0 md:mr-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32 md:ml-6" />
              <Skeleton className="h-4 w-16 md:ml-6" />
            </div>
          </div>
        </div>
      ));
    }

    if (!projects || projects.length === 0) {
      return (
        <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
          {t("no_projects")}
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-neutral-900/30 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
        {projects.map((project) => (
          <div key={project.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
              <div className="font-medium md:w-60">{project.title}</div>
              <div className="text-sm text-neutral-700/70 dark:text-neutral-300/70 md:ml-4">{project.client}</div>
            </div>
            
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
              <div className="flex items-center">
                {project.platforms && project.platforms[0] && (
                  <div className="mr-2">
                    {project.platforms[0] === "instagram" && <i className="fab fa-instagram text-xs"></i>}
                    {project.platforms[0] === "tiktok" && <i className="fab fa-tiktok text-xs"></i>}
                    {project.platforms[0] === "youtube" && <i className="fab fa-youtube text-xs"></i>}
                    {project.platforms[0] === "telegram" && <i className="fab fa-telegram-plane text-xs"></i>}
                    {project.platforms[0] === "vk" && <i className="fab fa-vk text-xs"></i>}
                  </div>
                )}
                <div className={`text-xs px-2 py-0.5 rounded ${
                  project.status === "completed" 
                    ? "bg-secondary text-white" 
                    : project.workflowStage === "scenario"
                    ? "bg-primary text-white"
                    : project.workflowStage === "material"
                    ? "bg-warning text-white" 
                    : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                }`}>
                  {project.status === "completed" 
                    ? t("completed") 
                    : t(project.workflowStage)}
                </div>
              </div>
              
              <div className="text-xs text-neutral-500/50 dark:text-neutral-400/50 md:ml-6">
                {project.status === "completed" 
                  ? `${t("completed_on")}: ${formatDeadline(project.startDate)}` 
                  : project.deadline
                  ? `${t("deadline")}: ${formatDeadline(project.deadline)}`
                  : t("no_deadline")}
              </div>
              
              <Button variant="link" className="text-primary text-sm md:ml-6" asChild>
                <Link href={`/projects/${project.id}`}>{t("open")}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageContainer
      title={t("my_dashboard")}
      subtitle={t("campaign_management")}
    >
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {renderStatCards()}
      </div>

      {/* Projects requiring action */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold font-sf-pro">{t("needs_action")}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderActionRequiredProjects()}
        </div>
      </div>

      {/* All Projects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold font-sf-pro">{t("all_projects")}</h2>
        </div>
        
        {renderAllProjects()}
      </div>
    </PageContainer>
  );
}
