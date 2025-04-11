import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Influencer } from "@/lib/types";
import { influencers as InfluencersApi, projectInfluencers as ProjectInfluencersApi } from "@/lib/api";

interface AddInfluencerFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export function AddInfluencerForm({ projectId, onSuccess }: AddInfluencerFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string>("");

  const { data: influencers = [], isLoading: isLoadingInfluencers } = useQuery<Influencer[]>({
    queryKey: ["/api/influencers"],
    queryFn: async (): Promise<Influencer[]> => InfluencersApi.list()
  });

  const addInfluencerMutation = useMutation({
    mutationFn: async (influencerId: number) => {
      return await ProjectInfluencersApi.create(projectId, {  
        influencer_id: influencerId,
        scenario_status: "pending",
        material_status: "pending",
        publication_status: "pending"
      });
    },
    onSuccess: () => {
      toast({
        title: t('influencer_added'),
        description: t('influencer_added_to_project_success'),
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setSelectedInfluencerId("");
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInfluencerId) {
      addInfluencerMutation.mutate(Number(selectedInfluencerId));
    } else {
      toast({
        title: t('error'),
        description: t('please_select_influencer'),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="influencer">{t('select_influencer')}</Label>
        <Select 
          value={selectedInfluencerId} 
          onValueChange={setSelectedInfluencerId}
          disabled={isLoadingInfluencers || addInfluencerMutation.isPending}
        >
          <SelectTrigger id="influencer" className="w-full">
            <SelectValue placeholder={t('select_influencer_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {influencers?.map((influencer) => (
              <SelectItem key={influencer.id} value={String(influencer.id)}>
                {influencer.nickname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-primary text-white"
          disabled={isLoadingInfluencers || addInfluencerMutation.isPending}
        >
          {addInfluencerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t('add_influencer')}
        </Button>
      </div>
    </form>
  );
}