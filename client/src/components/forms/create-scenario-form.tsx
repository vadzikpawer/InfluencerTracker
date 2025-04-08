import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z.string().min(10, { message: "Содержание должно содержать не менее 10 символов" }),
  googleDocUrl: z.string().url({ message: "Необходимо ввести корректный URL" }).optional().or(z.literal("")),
  deadline: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateScenarioFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export function CreateScenarioForm({ projectId, onSuccess }: CreateScenarioFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      googleDocUrl: "",
      deadline: null,
    },
  });

  const createScenarioMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/scenarios`, {
        ...data,
        status: "added"
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('scenario_created'),
        description: t('scenario_created_success'),
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/scenarios`] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormValues) {
    createScenarioMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white">
          {t('create_scenario')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('create_scenario')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="googleDocUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('google_doc_url')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://docs.google.com/document/d/..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('google_doc_url_description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('scenario_content')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('scenario_content_placeholder')} 
                      className="min-h-28" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('scenario_content_description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('deadline') || 'Крайний срок'}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ru })
                          ) : (
                            <span>{t('select_date') || 'Выберите дату'}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {t('deadline_description') || 'Укажите крайний срок для подготовки сценария'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mr-2">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={createScenarioMutation.isPending}>
                {createScenarioMutation.isPending ? t('creating') : t('create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}