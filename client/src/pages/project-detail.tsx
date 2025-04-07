import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialIcon } from "@/components/ui/social-icon";
import { Timeline } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Comments } from "@/components/ui/comments-section";
import { ArrowLeft, FileText, Image, Share2, ExternalLink, Paperclip, Plus } from "lucide-react";
import { Link } from "wouter";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ProjectDetailProps {
  id: string;
}

export default function ProjectDetail({ id }: ProjectDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"scenario" | "material" | "publication">("scenario");
  
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: [`/api/projects/${id}`],
  });
  
  const { data: influencers, isLoading: isLoadingInfluencers } = useQuery({
    queryKey: [`/api/projects/${id}/influencers`],
  });
  
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/projects/${id}/comments`],
  });
  
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: [`/api/projects/${id}/activities`],
  });

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
      if (activity.activityType.includes('approved') || 
          activity.activityType.includes('published') || 
          activity.activityType.includes('verified')) return 'completed';
      if (activity.activityType.includes('created') || 
          activity.activityType.includes('updated') || 
          activity.activityType.includes('submitted')) return 'active';
      return 'pending';
    };

    return {
      title: activity.activityType,
      date: activity.createdAt,
      status: getStatus() as 'completed' | 'active' | 'pending'
    };
  }) || [];

  if (timelineItems.length === 0) {
    timelineItems.push(
      {
        title: 'project_created',
        date: project.createdAt,
        status: 'completed'
      }
    );
    
    if (project.workflowStage === 'scenario' || project.workflowStage === 'material' || project.workflowStage === 'publication') {
      timelineItems.push({
        title: 'scenario_phase',
        date: project.workflowStage === 'scenario' ? t('current') : t('completed'),
        status: project.workflowStage === 'scenario' ? 'active' : 'completed'
      });
    }
    
    if (project.workflowStage === 'material' || project.workflowStage === 'publication') {
      timelineItems.push({
        title: 'material_phase',
        date: project.workflowStage === 'material' ? t('current') : t('completed'),
        status: project.workflowStage === 'material' ? 'active' : 'completed'
      });
    }
    
    if (project.workflowStage === 'publication') {
      timelineItems.push({
        title: 'publication_phase',
        date: t('current'),
        status: 'active'
      });
    }
  }

  return (
    <PageContainer>
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
          <Button variant="outline" className="text-primary" asChild>
            <Link href={`/projects/${id}/edit`}>
              {t("edit_project")}
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
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
                  <ul className="list-disc list-inside text-sm text-neutral-800/80 dark:text-neutral-200/80 space-y-1 mb-4">
                    <li>Акцент на удобство планирования путешествий</li>
                    <li>Демонстрация функций бронирования отелей и авиабилетов</li>
                    <li>Упоминание скидочного кода для подписчиков: TRAVEL2023</li>
                    <li>Показать мобильный интерфейс приложения в процессе использования</li>
                  </ul>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-neutral-500 dark:text-neutral-400">{t('last_updated')}: 20.05.2023</div>
                    <Button variant="link" className="text-primary p-0">{t('edit')}</Button>
                  </div>
                </Card>
                
                {/* Scenario content */}
                <Card className="bg-white dark:bg-neutral-900/30 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold font-sf-pro">{t('scenario')}</h3>
                    <StatusBadge status="approved" />
                  </div>
                  
                  <Card className="border border-neutral-200/50 dark:border-neutral-800/50 rounded-lg p-3 bg-neutral-100/50 dark:bg-neutral-900/50 mb-4">
                    <p className="text-sm text-neutral-800/80 dark:text-neutral-200/80 whitespace-pre-line">
                      1. Приветствие и представление приложения TravelBuddy<br />
                      2. Краткий рассказ о планировании предстоящего отпуска<br />
                      3. Демонстрация поиска и бронирования отеля через приложение<br />
                      4. Демонстрация поиска и бронирования авиабилетов<br />
                      5. Показ функции сохранения билетов и бронирований в личном кабинете<br />
                      6. Упоминание уникального скидочного кода TRAVEL2023<br />
                      7. Призыв к действию: скачать приложение в App Store и Google Play
                    </p>
                  </Card>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400">{t('approved')}:</span>
                      <span className="ml-1">22.05.2023</span>
                    </div>
                    
                    <div className="flex">
                      <Button variant="link" className="text-primary text-sm p-0 mr-3">{t('version_history')}</Button>
                      <Button 
                        className="bg-primary text-white text-sm"
                        onClick={() => setActiveTab('material')}
                      >
                        {t('proceed_to_materials')}
                      </Button>
                    </div>
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
                      <div>{formatDate(project.startDate)}</div>
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
                    
                    {project.technicalLinks && project.technicalLinks.length > 0 && (
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-3">
                        <div className="text-neutral-600/60 dark:text-neutral-400/60 mb-2">{t('technical_links')}</div>
                        {project.technicalLinks.map((link, index) => (
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
                    <Button variant="link" className="text-primary text-sm p-0">
                      <Plus className="h-4 w-4 mr-1" /> {t('add')}
                    </Button>
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
                                @{influencer.instagramHandle || influencer.nickname}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {influencer.instagramHandle && (
                              <div className="flex items-center">
                                <SocialIcon platform="instagram" size="sm" className="mr-1" />
                                <div className="text-xs">
                                  {influencer.instagramFollowers ? 
                                    (influencer.instagramFollowers > 1000 ? 
                                      `${Math.floor(influencer.instagramFollowers / 1000)}K` : 
                                      influencer.instagramFollowers) : 
                                    '-'}
                                </div>
                              </div>
                            )}
                            
                            {influencer.tiktokHandle && (
                              <div className="flex items-center ml-2">
                                <SocialIcon platform="tiktok" size="sm" className="mr-1" />
                                <div className="text-xs">
                                  {influencer.tiktokFollowers ? 
                                    (influencer.tiktokFollowers > 1000 ? 
                                      `${Math.floor(influencer.tiktokFollowers / 1000)}K` : 
                                      influencer.tiktokFollowers) : 
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
                      <div>{formatDate(project.startDate)}</div>
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
                    
                    {project.technicalLinks && project.technicalLinks.length > 0 && (
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-3">
                        <div className="text-neutral-600/60 dark:text-neutral-400/60 mb-2">{t('technical_links')}</div>
                        {project.technicalLinks.map((link, index) => (
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
                    {project.workflowStage === 'publication' ? (
                      <StatusBadge status="pending" />
                    ) : (
                      <StatusBadge status="draft" label={t('not_started')} className="bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" />
                    )}
                  </div>
                  
                  <div className="bg-neutral-100/50 dark:bg-neutral-900/50 rounded-lg p-4 mb-4">
                    {project.workflowStage === 'publication' ? (
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
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button className="bg-primary text-white">
                          {t('submit_publications')}
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
                      <div>{formatDate(project.startDate)}</div>
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
                    
                    {project.technicalLinks && project.technicalLinks.length > 0 && (
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-3">
                        <div className="text-neutral-600/60 dark:text-neutral-400/60 mb-2">{t('technical_links')}</div>
                        {project.technicalLinks.map((link, index) => (
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
