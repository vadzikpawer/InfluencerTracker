import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialIcon } from "@/components/ui/social-icon";
import { Timeline } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Comments } from "@/components/ui/comments-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Image, Share2, ExternalLink, Paperclip, Plus, Trash2, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { AddInfluencerForm } from "@/components/forms/add-influencer-form";
import { CreateScenarioForm } from "@/components/forms/create-scenario-form";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project, Activity, Comment, Influencer, Scenario, WorkflowStage } from "@/lib/types";
import { projects as ProjectsApi, scenarios as ScenariosApi, activities as ActivitiesApi, comments as CommentsApi, publications as PublicationsApi, influencers as InfluencersApi } from "@/lib/api";

interface ProjectDetailProps {
  id: string;
}

export default function ProjectDetail({ id }: ProjectDetailProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"scenario" | "material" | "publication">("scenario");
  const [addInfluencerDialogOpen, setAddInfluencerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publicationUrls, setPublicationUrls] = useState<Record<string, string>>({});
  
  const { data: project = {} as Project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    queryFn: async (): Promise<Project> => ProjectsApi.get(Number(id))
  });
  
  const { data: influencers = [] as Influencer[], isLoading: isLoadingInfluencers } = useQuery<Influencer[]>({
    queryKey: [`/api/projects/${id}/influencers`],
    queryFn: async (): Promise<Influencer[]> => InfluencersApi.list(Number(id))
  });
  
  const { data: comments = [] as Comment[] } = useQuery<Comment[]>({
    queryKey: [`/api/projects/${id}/comments`],
    queryFn: async (): Promise<Comment[]> => CommentsApi.list(Number(id))
  });
  
  const { data: activities = [] as Activity[] } = useQuery<Activity[]>({
    queryKey: [`/api/projects/${id}/activities`],
    queryFn: async (): Promise<Activity[]> => ActivitiesApi.list(Number(id))
  });
  
  const { data: scenarios = [] as Scenario[], isLoading: isLoadingScenarios } = useQuery<Scenario[]>({
    queryKey: [`/api/projects/${id}/scenarios`],
    queryFn: async (): Promise<Scenario[]> => ScenariosApi.list(Number(id))
  });
  
  const updateWorkflowStageMutation = useMutation({
    mutationFn: (stage: WorkflowStage) => ProjectsApi.updateWorkflowStage(Number(id), stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/activities`] });
      toast({
        title: t("workflow_updated"),
        description: t("project_stage_changed"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const approveScenarioMutation = useMutation({
    mutationFn: async (scenarioId: number) => {
      const res = await ScenariosApi.update(Number(id), scenarioId, { 
        status: "approved",
        approved_at: new Date().toISOString()
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/scenarios`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/activities`] });
      
      toast({
        title: t("scenario_approved"),
        description: t("scenario_approval_success"),
      });
      
      // Update project workflow stage to material if we're still in scenario stage
      if (project?.workflow_stage === WorkflowStage.SCENARIO) {
        updateWorkflowStageMutation.mutate(WorkflowStage.MATERIAL);
      }
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteScenarioMutation = useMutation({
    mutationFn: async (scenarioId: number) => {
      try {
        await ScenariosApi.delete(Number(id), scenarioId);
        return scenarioId;
      } catch (error) {
        throw new Error(t("delete_scenario_error"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/scenarios`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/activities`] });
      
      toast({
        title: t("scenario_deleted"),
        description: t("scenario_deleted_success"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await ProjectsApi.delete(Number(id));
        return res.data;
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error &&
            error.response && typeof error.response === 'object' && 'data' in error.response &&
            error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data &&
            typeof error.response.data.message === 'string') {
          throw new Error(error.response.data.message);
        }
        throw new Error(t("project_delete_error")); 
      }
    },
    onSuccess: () => {
      // Invalidate the projects query cache so the list gets refreshed
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/manager'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities/recent'] });
      
      toast({
        title: t("project_deleted"),
        description: t("project_delete_success"),
      });
      navigate("/projects");
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
    },
  });

  const submitPublicationsMutation = useMutation({
    mutationFn: async (publications: { platform: string; publicationUrl: string }[]) => {
      const response = await PublicationsApi.create(Number(id), {
        project_id: Number(id),
        influencer_id: 0, // This should be set to the actual influencer ID
        platform: publications[0].platform,
        publication_url: publications[0].publicationUrl,
        published_at: new Date().toISOString()
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t("publication_submitted"),
        description: t("publication_submitted_success"),
      });
      // Reset form
      setPublicationUrls({});
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("publication_submit_error"),
        variant: "destructive",
      });
    }
  });

  const handlePublicationSubmit = () => {
    const publications = Object.entries(publicationUrls)
      .filter(([_, url]) => url.trim())
      .map(([platform, url]) => {
        // Normalize platform values to match schema
        const normalizedPlatform = platform === 'vk_clips' ? 'vk' : 
                                 platform === 'youtube_shorts' ? 'youtube' : 
                                 platform;
        
        return {
          platform: normalizedPlatform,
          publicationUrl: url
        };
      });

    if (publications.length === 0) {
      toast({
        title: t("error"),
        description: t("no_publications_to_submit"),
        variant: "destructive",
      });
      return;
    }

    submitPublicationsMutation.mutate(publications);
  };

  const handleUrlChange = (platform: string, url: string) => {
    setPublicationUrls(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  if (isLoadingProject) {
    return (
      <PageContainer>
        <div className="flex items-center mb-2">
          <Button variant="link" className="text-primary p-0 mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <Skeleton className="h-12 w-full mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-2">{t("project_not_found")}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            {t("project_not_found_description")}
          </p>
          <Button asChild className="bg-primary text-white">
            <Link href="/projects">{t("back_to_projects")}</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd.MM.yyyy', { locale: ru });
  };

  const timelineItems = activities?.map(activity => {
    const getStatus = () => {
      if (activity.activity_type.includes('approved') || 
          activity.activity_type.includes('published') || 
          activity.activity_type.includes('verified')) return 'completed';
      if (activity.activity_type.includes('created') || 
          activity.activity_type.includes('updated') || 
          activity.activity_type.includes('submitted')) return 'active';
      return 'pending';
    };

    return {
      title: activity.activity_type,
      date: activity.created_at,
      status: getStatus() as 'completed' | 'active' | 'pending'
    };
  }) || [];

  if (timelineItems.length === 0) {
    timelineItems.push(
      {
        title: 'project_created',
        date: project.created_at,
        status: 'completed'
      }
    );
    
    if (project.workflow_stage === 'scenario' || project.workflow_stage === 'material' || project.workflow_stage === 'publication') {
      timelineItems.push({
        title: 'scenario_phase',
        date: project.created_at,
        status: project.workflow_stage === 'scenario' ? 'active' : 'completed'
      });
    }
    
    if (project.workflow_stage === 'material' || project.workflow_stage === 'publication') {
      timelineItems.push({
        title: 'material_phase',
        date: project.created_at,
        status: project.workflow_stage === 'material' ? 'active' : 'completed'
      });
    }
    
    if (project.workflow_stage === 'publication') {
      timelineItems.push({
        title: 'publication_phase',
        date: project.created_at,
        status: 'active'
      });
    }
  }

  return (
    <PageContainer>
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("delete_project_confirmation")}</DialogTitle>
            <DialogDescription>
              {t("delete_project_warning")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">
              {t("project_to_delete")}: <span className="font-bold">{project.title}</span>
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("delete_project_permanent")}
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteProjectMutation.mutate()}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? t("deleting...") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Button variant="link" className="text-primary p-0 mr-2" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold font-sf-pro">{project.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-primary" asChild>
              <Link href={`/projects/${id}/edit`}>
                {t("edit_project")}
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("delete_project")}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <StatusBadge status={project.status as any} />
          <StatusBadge 
            status="draft" 
            label={`${t('client')}: ${project.client}`} 
            className="bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" 
          />
          {project.erid && (
            <StatusBadge 
              status="draft" 
              label={`ERID: ${project.erid}`} 
              className="bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" 
            />
          )}
          
          <div className="ml-auto flex items-center">
            <span className="text-sm mr-2">{t('project_stage')}:</span>
            <Select 
              value={project.workflow_stage} 
              onValueChange={(value) => updateWorkflowStageMutation.mutate(value as WorkflowStage)}
              disabled={updateWorkflowStageMutation.isPending}
            >
              <SelectTrigger className="w-36 h-9 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                <SelectValue>
                  {project.workflow_stage === 'scenario' && t('scenario')}
                  {project.workflow_stage === 'material' && t('material')}
                  {project.workflow_stage === 'publication' && t('publication')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scenario">{t('scenario')}</SelectItem>
                <SelectItem value="material">{t('material')}</SelectItem>
                <SelectItem value="publication">{t('publication')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Project workflow tabs */}
      <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 mb-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="w-full flex divide-x divide-neutral-200/50 dark:divide-neutral-800/50 rounded-none bg-transparent h-auto">
            <TabsTrigger 
              value="scenario" 
              className="flex-1 py-3 px-2 text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-600/60 data-[state=inactive]:dark:text-neutral-400/60 rounded-none border-b-2 border-transparent"
            >
              <FileText className="h-4 w-4 mr-2" /> {t('scenario')}
            </TabsTrigger>
            <TabsTrigger 
              value="material" 
              className="flex-1 py-3 px-2 text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-600/60 data-[state=inactive]:dark:text-neutral-400/60 rounded-none border-b-2 border-transparent"
            >
              <Image className="h-4 w-4 mr-2" /> {t('material')}
            </TabsTrigger>
            <TabsTrigger 
              value="publication" 
              className="flex-1 py-3 px-2 text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-600/60 data-[state=inactive]:dark:text-neutral-400/60 rounded-none border-b-2 border-transparent"
            >
              <Share2 className="h-4 w-4 mr-2" /> {t('publication')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenario" className="mt-0 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Left column */}
              <div className="md:col-span-2">
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4 mb-6">
                  <h3 className="text-lg font-bold font-sf-pro mb-3">{t('project_description')}</h3>
                  <p className="text-sm text-neutral-800/80 dark:text-neutral-200/80 mb-4 whitespace-pre-line">
                    {project.description}
                  </p>
                  
                  <h4 className="font-medium mb-2">{t('key_requirements')}:</h4>
                  {project.key_requirements && project.key_requirements.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-neutral-800/80 dark:text-neutral-200/80 space-y-1 mb-4">
                      {project.key_requirements?.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mb-4">{t('no_key_requirements')}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-neutral-500 dark:text-neutral-400">{t('last_updated')}: 20.05.2023</div>
                    <Button 
                      variant="link" 
                      className="text-primary p-0" 
                      asChild
                    >
                      <Link href={`/projects/${id}/edit`}>{t('edit')}</Link>
                    </Button>
                  </div>
                </Card>
                
                {/* Scenario content */}
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold font-sf-pro">{t('scenario')}</h3>
                    <StatusBadge status={project.workflow_stage === 'scenario' ? 'pending' : 'completed'} />
                  </div>
                  
{isLoadingScenarios ? (
                    <div className="py-6">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 mr-3" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                      <Skeleton className="h-32 w-full mt-4" />
                      <div className="flex justify-end mt-3">
                        <Skeleton className="h-7 w-20" />
                      </div>
                    </div>
                  ) : scenarios.length > 0 ? (
                    <div className="py-4">
                      {scenarios.map((scenario, index) => (
                        <div key={scenario.id} className={`py-3 ${index > 0 ? 'border-t border-neutral-200/50 dark:border-neutral-800/50' : ''}`}>
                          <div className="flex justify-between mb-2">
                            <StatusBadge status={scenario.status as any} />
                          </div>
                          <div className="text-sm text-neutral-800/80 dark:text-neutral-200/80 mb-4 whitespace-pre-line">
                            {scenario.content}
                          </div>
                          {scenario.google_doc_url && (
                            <div className="mt-2 mb-4">
                              <a
                                href={scenario.google_doc_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary flex items-center text-sm"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" /> {t('google_doc')}
                              </a>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10 text-sm"
                              onClick={() => deleteScenarioMutation.mutate(scenario.id)}
                              disabled={deleteScenarioMutation.isPending}
                            >
                              {deleteScenarioMutation.isPending 
                                ? t('deleting...') 
                                : t('delete')}
                            </Button>
                            <Button 
                              className="bg-primary text-white text-sm"
                              onClick={() => approveScenarioMutation.mutate(scenario.id)}
                              disabled={scenario.status === 'approved' || approveScenarioMutation.isPending}
                            >
                              {approveScenarioMutation.isPending 
                                ? t('approving...') 
                                : scenario.status === 'approved' 
                                  ? t('approved') 
                                  : t('approve_scenario')}
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 flex justify-end">
                        <CreateScenarioForm 
                          projectId={Number(id)} 
                          onSuccess={() => {
                            // Refresh the scenarios after creating a new one
                            queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/scenarios`] });
                          }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <FileText className="h-12 w-12 text-neutral-400 mb-4" />
                      <h4 className="text-base font-medium mb-2">{t('create_scenario')}</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 max-w-md">
                        {t('scenario_description')}
                      </p>
                      <CreateScenarioForm 
                        projectId={Number(id)} 
                        onSuccess={() => {
                          // Refresh the scenarios after creating a new one
                          queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/scenarios`] });
                        }} 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end text-sm mt-4">
                    <Button 
                      className="bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 text-sm"
                      onClick={() => setActiveTab('material')}
                    >
                      {t('view_materials')}
                    </Button>
                  </div>
                </Card>
                
                {/* Comments section */}
                <Comments 
                  projectId={Number(id)} 
                  comments={comments || []} 
                />
              </div>
              
              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Project info */}
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4">
                  <h3 className="text-lg font-bold font-sf-pro mb-3">{t('information')}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('manager')}</div>
                      <div className="font-medium">{t('aleksey_smirnov')}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('start_date')}</div>
                      <div>{formatDate(project.start_date)}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('deadline')}</div>
                      <div className="text-warning">{project.deadline ? formatDate(project.deadline) : t('not_set')}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">ERID</div>
                      <div>{project.erid || '-'}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('budget')}</div>
                      <div>{project.budget ? `${project.budget.toLocaleString()} ₽` : '-'}</div>
                    </div>
                    
                    {project.technical_links && project.technical_links.length > 0 && (
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-3">
                        <div className="text-neutral-600/60 dark:text-neutral-400/60 mb-2">{t('technical_links')}</div>
                        {project.technical_links.map((link, index) => (
                          <a 
                            key={index} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary flex items-center mb-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" /> {link.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* Influencers */}
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold font-sf-pro">{t('influencers')}</h3>
                    <Dialog open={addInfluencerDialogOpen} onOpenChange={setAddInfluencerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="text-primary text-sm p-0">
                          <Plus className="h-4 w-4 mr-1" /> {t('add')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{t('add_influencer_to_project')}</DialogTitle>
                          <DialogDescription>
                            {t('add_influencer_description')}
                          </DialogDescription>
                        </DialogHeader>
                        <AddInfluencerForm 
                          projectId={Number(id)}
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/influencers`] });
                            setAddInfluencerDialogOpen(false);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {isLoadingInfluencers ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ) : influencers && influencers.length > 0 ? (
                    <div className="space-y-4">
                      {influencers.map((influencer, index) => (
                        <div 
                          key={influencer.id} 
                          className={`flex items-center justify-between ${
                            index > 0 ? 'pt-3 border-t border-neutral-200/50 dark:border-neutral-800/50' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <Avatar className="w-10 h-10 mr-3 bg-neutral-200 dark:bg-neutral-800">
                              <div className="flex items-center justify-center font-medium">
                                {influencer.nickname.substring(0, 2).toUpperCase()}
                              </div>
                            </Avatar>
                            <div>
                              <div className="font-medium">{influencer.nickname}</div>
                              <div className="text-xs text-neutral-600/60 dark:text-neutral-400/60">
                                @{influencer.instagram_handle || influencer.nickname}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {influencer.instagram_handle && (
                              <div className="flex items-center">
                                <SocialIcon platform="instagram" size="sm" className="mr-1" />
                                <div className="text-xs">
                                  {influencer.instagram_followers ? 
                                    (influencer.instagram_followers > 1000 ? 
                                      `${Math.floor(influencer.instagram_followers / 1000)}K` : 
                                      influencer.instagram_followers) : 
                                    '-'}
                                </div>
                              </div>
                            )}
                            
                            {influencer.tiktok_handle && (
                              <div className="flex items-center ml-2">
                                <SocialIcon platform="tiktok" size="sm" className="mr-1" />
                                <div className="text-xs">
                                  {influencer.tiktok_followers ? 
                                    (influencer.tiktok_followers > 1000 ? 
                                      `${Math.floor(influencer.tiktok_followers / 1000)}K` : 
                                      influencer.tiktok_followers) : 
                                    '-'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                      {t('no_influencers_assigned')}
                    </div>
                  )}
                </Card>
                
                {/* Timeline */}
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4">
                  <h3 className="text-lg font-bold font-sf-pro mb-3">{t('timeline')}</h3>
                  <Timeline items={timelineItems} />
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="material" className="mt-0 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="md:col-span-2">
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold font-sf-pro">{t('materials')}</h3>
                    <StatusBadge status="in_review" />
                  </div>
                  
                  <div className="bg-neutral-100/50 dark:bg-neutral-900/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg mb-4">
                      <div className="text-center">
                        <Image className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                        <div className="text-sm font-medium mb-1">{t('upload_materials')}</div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{t('drag_or_click')}</p>
                        <Button className="bg-primary text-white">
                          <Paperclip className="h-4 w-4 mr-2" /> {t('select_files')}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 italic text-center">
                      {t('no_materials_uploaded')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400">{t('deadline')}:</span>
                      <span className="ml-1 text-warning">{project.deadline ? formatDate(project.deadline) : t('not_set')}</span>
                    </div>
                    
                    <div className="flex">
                      <Button 
                        className="bg-primary text-white text-sm" 
                        disabled
                      >
                        {t('submit_for_approval')}
                      </Button>
                    </div>
                  </div>
                </Card>
                
                <Comments 
                  projectId={Number(id)} 
                  comments={comments || []} 
                />
              </div>
              
              <div className="space-y-6">
                {/* Same right sidebar components as in scenario tab */}
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4">
                  <h3 className="text-lg font-bold font-sf-pro mb-3">{t('information')}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('manager')}</div>
                      <div className="font-medium">{t('aleksey_smirnov')}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('start_date')}</div>
                      <div>{formatDate(project.start_date)}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('deadline')}</div>
                      <div className="text-warning">{project.deadline ? formatDate(project.deadline) : t('not_set')}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">ERID</div>
                      <div>{project.erid || '-'}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('budget')}</div>
                      <div>{project.budget ? `${project.budget.toLocaleString()} ₽` : '-'}</div>
                    </div>
                    
                    {project.technical_links && project.technical_links.length > 0 && (
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-3">
                        <div className="text-neutral-600/60 dark:text-neutral-400/60 mb-2">{t('technical_links')}</div>
                        {project.technical_links.map((link, index) => (
                          <a 
                            key={index} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary flex items-center mb-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" /> {link.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
                
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4">
                  <h3 className="text-lg font-bold font-sf-pro mb-3">{t('timeline')}</h3>
                  <Timeline items={timelineItems} />
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publication" className="mt-0 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="md:col-span-2">
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold font-sf-pro">{t('publications')}</h3>
                    {project.workflow_stage === 'publication' ? (
                      <StatusBadge status="pending" />
                    ) : (
                      <StatusBadge status="draft" label={t('not_started')} className="bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" />
                    )}
                  </div>
                  
                  <div className="bg-neutral-100/50 dark:bg-neutral-900/50 rounded-lg p-4 mb-4">
                    {project.workflow_stage === 'publication' ? (
                      <div>
                        <h4 className="font-medium mb-3">{t('add_publication_links')}</h4>
                        <div className="space-y-4 mb-4">
                          {project.platforms?.map((platform, index) => (
                            <div key={index} className="flex items-center">
                              <SocialIcon platform={platform as any} size="sm" className="mr-3" />
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder={`${t('enter_link')} ${platform}`}
                                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800/50 px-3 py-2 text-sm"
                                  value={publicationUrls[platform] || ''}
                                  onChange={(e) => handleUrlChange(platform, e.target.value)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          className="bg-primary text-white w-full"
                          onClick={handlePublicationSubmit}
                          disabled={submitPublicationsMutation.isPending}
                        >
                          {submitPublicationsMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('submitting')}
                            </>
                          ) : (
                            t('submit_publications')
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Share2 className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                        <h4 className="font-medium mb-1">{t('publication_not_started')}</h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {t('complete_material_phase')}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
                
                <Comments 
                  projectId={Number(id)} 
                  comments={comments || []} 
                />
              </div>
              
              <div className="space-y-6">
                {/* Same right sidebar components as in other tabs */}
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4">
                  <h3 className="text-lg font-bold font-sf-pro mb-3">{t('information')}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('manager')}</div>
                      <div className="font-medium">{t('aleksey_smirnov')}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('start_date')}</div>
                      <div>{formatDate(project.start_date)}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('deadline')}</div>
                      <div className="text-warning">{project.deadline ? formatDate(project.deadline) : t('not_set')}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">ERID</div>
                      <div>{project.erid || '-'}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-neutral-600/60 dark:text-neutral-400/60">{t('budget')}</div>
                      <div>{project.budget ? `${project.budget.toLocaleString()} ₽` : '-'}</div>
                    </div>
                    
                    {project.technical_links && project.technical_links.length > 0 && (
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-3">
                        <div className="text-neutral-600/60 dark:text-neutral-400/60 mb-2">{t('technical_links')}</div>
                        {project.technical_links.map((link, index) => (
                          <a 
                            key={index} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary flex items-center mb-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" /> {link.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
                
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4">
                  <h3 className="text-lg font-bold font-sf-pro mb-3">{t('timeline')}</h3>
                  <Timeline items={timelineItems} />
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </PageContainer>
  );
}
