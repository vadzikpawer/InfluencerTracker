import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/page-container";
import { ProjectCard } from "@/components/ui/project-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { projects as projectsApi } from "@/lib/api";
import { Project } from "@/lib/types";

export default function Projects() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => projectsApi.list()
  });

  const filteredProjects = projects?.filter((project: Project) => {
    // Filter by search term
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || project.status === statusFilter ||
      (statusFilter === "scenario" && project.workflow_stage === "scenario") ||
      (statusFilter === "material" && project.workflow_stage === "material") ||
      (statusFilter === "publication" && project.workflow_stage === "publication");
    
    // Filter by platform
    const matchesPlatform = platformFilter === "all" || 
      (project.platforms && project.platforms.includes(platformFilter));
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  return (
    <PageContainer
      title={t("projects")}
      subtitle={t("project_management")}
      action={
        <Button className="bg-primary text-white" asChild>
          <Link to="/projects/new">
            <Plus className="h-4 w-4 mr-2" /> {t("new_project")}
          </Link>
        </Button>
      }
    >
      {/* Filters */}
      <Card className="bg-white dark:bg-neutral-900/30 p-4 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder={t("search_projects")}
              className="w-full py-2 pl-10 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50">
                <SelectValue placeholder={t("all_statuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_statuses")}</SelectItem>
                <SelectItem value="draft">{t("draft")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="completed">{t("completed")}</SelectItem>
                <SelectItem value="scenario">{t("scenario")}</SelectItem>
                <SelectItem value="material">{t("material")}</SelectItem>
                <SelectItem value="publication">{t("publication")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50">
                <SelectValue placeholder={t("all_platforms")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_platforms")}</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="vk">ВКонтакте</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-neutral-900/30">
              <Skeleton className="h-48 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              client={project.client}
              status={project.status}
              workflowStage={project.workflow_stage}
              platforms={project.platforms || []}
              scenarioStatus="approved"
              materialStatus={project.workflow_stage === "material" ? "in_review" : "pending"}
              publicationStatus="pending"
              deadline={project.deadline ? new Date(project.deadline) : undefined}
              influencers={[{ initials: "ЕК", name: "Екатерина Котова" }]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg font-medium mb-2">{t("no_projects")}</div>
          <div className="text-neutral-500 dark:text-neutral-400 mb-4">
            {t("create_first_project")}
          </div>
          <Button className="bg-primary text-white" asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4 mr-2" /> {t("new_project")}
            </Link>
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
