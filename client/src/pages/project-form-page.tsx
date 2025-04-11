import { useQuery } from "@tanstack/react-query";
import { ProjectForm } from "@/components/project-form";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { projects } from "@/lib/api";
import { Project, ProjectStatus, WorkflowStage } from "@/lib/types";

interface ProjectFormPageProps {
  id?: string;
}

export default function ProjectFormPage({ id }: ProjectFormPageProps) {
  const isNew = id === "new";
  
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    queryFn: async (): Promise<Project> => projects.get(Number(id)),
    enabled: !isNew && !!id,
  });
  
  const { data: emptyProject, isLoading: isLoadingEmpty } = useQuery<Project>({
    queryKey: ["/api/projects/new"],
    queryFn: async (): Promise<Project> => ({
      id: 0,
      title: "",
      client: "",
      description: "",
      key_requirements: [],
      start_date: new Date().toISOString(),
      status: ProjectStatus.ACTIVE,
      workflow_stage: WorkflowStage.SCENARIO,
      manager_id: 0,
      created_at: new Date().toISOString()
    }),
    enabled: isNew,
  });

  // Show loading state
  if ((isNew && isLoadingEmpty) || (!isNew && isLoading)) {
    return (
      <PageContainer>
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-[500px] w-full" />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <ProjectForm 
        project={isNew ? emptyProject : project} 
        isNew={isNew} 
      />
    </PageContainer>
  );
}