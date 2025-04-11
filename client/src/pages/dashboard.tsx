import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/ui/activity-card";
import { ProjectCard } from "@/components/ui/project-card";
import { Link } from "wouter";
import { ArrowUp, Clock, UserPlus, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Project, Activity } from "@/lib/types";
import { projects as projectsApi, activities as activitiesApi } from "@/lib/api";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats/manager"],
    enabled: !!user && user.role === "manager",
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      const apiActivities = await activitiesApi.list(0);
      return apiActivities.map(activity => ({
        ...activity,
        activityType: activity.activity_type,
        createdAt: activity.created_at
      }));
    },
    enabled: !!user,
  });
  
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => projectsApi.list(),
    enabled: !!user,
  });

  // Filter projects requiring attention
  const urgentProjects = projects?.filter(project => 
    project.status === "active" && 
    (project.workflow_stage === "scenario" || project.workflow_stage === "material")
  ).slice(0, 2);

  const renderStatCards = () => {
    if (isLoadingStats) {
      return Array(4).fill(0).map((_, i) => (
        <Card key={i} className="bg-white dark:bg-neutral-900/30">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-4 w-32" />
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
            <div className="text-xs text-secondary mt-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" /> +2 {t("per_week")}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60 mb-1">{t("pending_reviews")}</div>
            <div className="text-2xl font-bold font-sf-pro">{stats.pendingReviews}</div>
            <div className="text-xs text-warning mt-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" /> 
              {stats.pendingReviewsDetails.scenario} {t("scenario")}, 
              {stats.pendingReviewsDetails.material} {t("material")}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60 mb-1">{t("influencers")}</div>
            <div className="text-2xl font-bold font-sf-pro">{stats.influencersCount}</div>
            <div className="text-xs text-primary mt-2 flex items-center">
              <UserPlus className="h-3 w-3 mr-1" /> 6 {t("new")}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60 mb-1">{t("completed_this_month")}</div>
            <div className="text-2xl font-bold font-sf-pro">{stats.completedProjects}</div>
            <div className="text-xs text-secondary mt-2 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" /> 25 {t("publications")}
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderActivities = () => {
    if (isLoadingActivities) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="p-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div className="flex">
            <Skeleton className="h-8 w-8 rounded-full mr-3" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ));
    }

    if (!activities || activities.length === 0) {
      return (
        <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
          {t("no_activities")}
        </div>
      );
    }

    return activities.map((activity) => (
      <ActivityCard 
        key={activity.id} 
        activity={{
          ...activity,
          activityType: activity.activity_type,
          createdAt: activity.created_at
        }}
        className="border-b border-neutral-200/50 dark:border-neutral-800/50"
      />
    ));
  };

  const renderUrgentProjects = () => {
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

    if (!urgentProjects || urgentProjects.length === 0) {
      return (
        <div className="col-span-full p-6 text-center text-neutral-500 dark:text-neutral-400">
          {t("no_urgent_projects")}
        </div>
      );
    }

    return urgentProjects.map((project) => (
      <ProjectCard
        key={project.id}
        id={project.id}
        title={project.title}
        client={project.client}
        status={project.status}
        workflowStage={project.workflow_stage}
        platforms={project.platforms || []}
        scenarioStatus="approved"
        materialStatus="in_review"
        publicationStatus="pending"
        deadline={new Date(project.deadline || "")}
        actionRequired={{
          required: true,
          message: project.workflow_stage === "scenario" 
            ? t("scenario_needs_review") 
            : t("material_needs_review"),
        }}
      />
    ));
  };

  return (
    <PageContainer
      title={t("dashboard")}
      subtitle={t("overview")}
    >
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {renderStatCards()}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold font-sf-pro">{t("recent_activities")}</h2>
          <Button variant="link" className="text-primary" asChild>
            <Link to="/activities">{t("all_activities")}</Link>
          </Button>
        </div>
        
        <Card className="bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50 divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
          {renderActivities()}
        </Card>
      </div>

      {/* Projects requiring attention */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold font-sf-pro">{t("requires_attention")}</h2>
          <Button variant="link" className="text-primary" asChild>
            <Link to="/projects">{t("all_projects")}</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderUrgentProjects()}
        </div>
      </div>
    </PageContainer>
  );
}
