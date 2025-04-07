import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ProjectForm } from "@/components/project-form";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectFormPageProps {
  id?: string;
}

export default function ProjectFormPage({ id }: ProjectFormPageProps) {
  const { t } = useTranslation();
  const isNew = id === "new";
  
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: !isNew && !!id,
  });
  
  const { data: emptyProject, isLoading: isLoadingEmpty } = useQuery({
    queryKey: ["/api/projects/new"],
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