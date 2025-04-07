import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Extend the schema to add validation
const formSchema = insertProjectSchema.extend({
  title: z.string().min(1, { message: "Название проекта обязательно" }),
  client: z.string().min(1, { message: "Название клиента обязательно" }),
  platforms: z.array(z.string()).optional(),
  technicalLinks: z.array(z.object({
    title: z.string(),
    url: z.string().url({ message: "Введите корректный URL" })
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  project?: any;
  isNew?: boolean;
}

const platformOptions = [
  { id: "instagram", label: "Instagram" },
  { id: "vk_clips", label: "VK Clips" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube_shorts", label: "YouTube Shorts" },
  { id: "telegram", label: "Telegram" },
];

export function ProjectForm({ project, isNew = false }: ProjectFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [technicalLinkInput, setTechnicalLinkInput] = useState({ title: "", url: "" });

  // Default values depend on whether we're creating or editing
  const defaultValues: Partial<FormValues> = {
    title: project?.title || "",
    client: project?.client || "",
    description: project?.description || "",
    platforms: project?.platforms || [],
    budget: project?.budget || undefined,
    erid: project?.erid || "",
    managerId: user?.role === "manager" ? user?.id : project?.managerId || null,
    technicalLinks: project?.technicalLinks || [],
    status: "draft",
    workflowStage: "scenario"
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("project_created"),
        description: t("project_created_success"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/projects/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: t("project_create_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PATCH", `/api/projects/${project.id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("project_updated"),
        description: t("project_updated_success"),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/projects/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: t("project_update_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormValues) {
    if (isNew) {
      createProjectMutation.mutate(data);
    } else {
      updateProjectMutation.mutate(data);
    }
  }

  function addTechnicalLink() {
    if (!technicalLinkInput.title || !technicalLinkInput.url) return;
    
    try {
      // Validate URL
      new URL(technicalLinkInput.url);
      
      const currentLinks = form.getValues("technicalLinks") || [];
      form.setValue("technicalLinks", [
        ...currentLinks, 
        { title: technicalLinkInput.title, url: technicalLinkInput.url }
      ]);
      
      setTechnicalLinkInput({ title: "", url: "" });
    } catch (error) {
      toast({
        title: t("invalid_url"),
        description: t("please_enter_valid_url"),
        variant: "destructive",
      });
    }
  }

  function removeTechnicalLink(index: number) {
    const currentLinks = form.getValues("technicalLinks") || [];
    form.setValue("technicalLinks", currentLinks.filter((_, i) => i !== index));
  }

  return (
    <Card className="bg-white dark:bg-neutral-900/30 p-6 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50">
      <div className="flex items-center mb-6">
        <Button variant="link" className="text-primary p-0 mr-2" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-sf-pro">
          {isNew ? t("new_project") : t("edit_project")}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("project_title")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("enter_project_title")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("client_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("enter_client_name")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("description")}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder={t("enter_project_description")} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("budget")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      placeholder={t("enter_budget")} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="erid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ERID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("enter_erid")} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <h3 className="text-base font-medium mb-2">{t("platforms")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {platformOptions.map((platform) => (
                <FormField
                  key={platform.id}
                  control={form.control}
                  name="platforms"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(platform.id)}
                          onCheckedChange={(checked) => {
                            let updatedPlatforms = [...(field.value || [])];
                            if (checked) {
                              updatedPlatforms.push(platform.id);
                            } else {
                              updatedPlatforms = updatedPlatforms.filter(
                                (p) => p !== platform.id
                              );
                            }
                            field.onChange(updatedPlatforms);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">{platform.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium mb-2">{t("technical_links")}</h3>
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <FormLabel>{t("link_title")}</FormLabel>
                <Input
                  placeholder={t("enter_link_title")}
                  value={technicalLinkInput.title}
                  onChange={(e) => setTechnicalLinkInput(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <FormLabel>{t("link_url")}</FormLabel>
                <Input
                  placeholder="https://..."
                  value={technicalLinkInput.url}
                  onChange={(e) => setTechnicalLinkInput(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <Button 
                type="button" 
                variant="outline"
                onClick={addTechnicalLink}
              >
                {t("add")}
              </Button>
            </div>

            {/* Display added links */}
            <div className="space-y-2">
              {form.watch("technicalLinks")?.map((link, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-100/50 dark:bg-neutral-900/50 p-2 rounded-md">
                  <div>
                    <div className="font-medium">{link.title}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                      {link.url}
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeTechnicalLink(index)}
                  >
                    {t("remove")}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-end">
            <div className="flex gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/projects">{t("cancel")}</Link>
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-white"
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isNew ? t("create_project") : t("save_changes")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}