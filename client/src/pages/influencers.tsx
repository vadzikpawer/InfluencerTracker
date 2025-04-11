import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/contexts/auth";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { SocialIcon } from "@/components/ui/social-icon";
import { Search, UserPlus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Influencer } from "@/lib/types";
import { influencers as influencersApi } from "@/lib/api";

export default function Influencers() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    bio: "",
    instagram: "",
    tiktok: ""
  });
  
  const queryClient = useQueryClient();

  const { data: influencers, isLoading } = useQuery<Influencer[]>({
    queryKey: ["/api/influencers"],
    queryFn: async () => {
      const response = await influencersApi.list();
      return response.map((influencer) => ({
        ...influencer,
        instagram_handle: influencer.instagram_handle,
        tiktok_handle: influencer.tiktok_handle,
        youtube_handle: influencer.youtube_handle,
        telegram_handle: influencer.telegram_handle,
        vk_handle: influencer.vk_handle,
        instagram_followers: influencer.instagram_followers,
        tiktok_followers: influencer.tiktok_followers,
        youtube_followers: influencer.youtube_followers,
        telegram_followers: influencer.telegram_followers,
        vk_followers: influencer.vk_followers
      }));
    }
  });

  const filteredInfluencers = influencers?.filter((influencer: Influencer) => {
    // Filter by search term
    const matchesSearch = 
      influencer.nickname.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by platform
    const matchesPlatform = 
      platformFilter === "all" || 
      (platformFilter === "instagram" && influencer.instagram_handle) ||
      (platformFilter === "tiktok" && influencer.tiktok_handle) ||
      (platformFilter === "youtube" && influencer.youtube_handle) ||
      (platformFilter === "telegram" && influencer.telegram_handle) ||
      (platformFilter === "vk" && influencer.vk_handle);
    
    return matchesSearch && matchesPlatform;
  });

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const { mutate: addInfluencer } = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await influencersApi.create({
        nickname: data.nickname,
        instagram_handle: data.instagram,
        tiktok_handle: data.tiktok,
        manager_id: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/${id}/influencers"] });
      setIsAddDialogOpen(false);
      setFormData({ nickname: "", bio: "", instagram: "", tiktok: "" });
    }
  });

  return (
    <PageContainer
      title={t("influencers")}
      subtitle={t("manage_influencers")}
      action={
        <Button className="bg-primary text-white" onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> {t("add_influencer")}
        </Button>
      }
    >
      {/* Filters */}
      <Card className="bg-white dark:bg-neutral-900/30 p-4 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder={t("search_influencers")}
              className="w-full py-2 pl-10 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-40 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50">
              <SelectValue placeholder={t("all_platforms")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_platforms")}</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Influencers List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-neutral-900/30 p-4">
              <div className="flex items-start">
                <Skeleton className="h-16 w-16 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <div className="flex space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredInfluencers && filteredInfluencers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInfluencers.map((influencer) => (
            <Card key={influencer.id} className="bg-white dark:bg-neutral-900/30 p-4 border border-neutral-200/50 dark:border-neutral-800/50">
              <div className="flex items-start">
                <Avatar className="h-16 w-16 mr-4 bg-neutral-200 dark:bg-neutral-800">
                  <div className="text-lg font-medium w-full h-full flex items-center justify-center">
                    {influencer.nickname.substring(0, 2).toUpperCase()}
                  </div>
                </Avatar>
                
                <div>
                  <h3 className="font-bold mb-1">{influencer.nickname}</h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {influencer.instagram_handle && (
                      <div className="flex items-center" title="Instagram">
                        <SocialIcon platform="instagram" size="sm" className="mr-1.5" />
                        <span className="text-xs font-medium">
                          {formatFollowers(influencer.instagram_followers)}
                        </span>
                      </div>
                    )}
                    
                    {influencer.tiktok_handle && (
                      <div className="flex items-center" title="TikTok">
                        <SocialIcon platform="tiktok" size="sm" className="mr-1.5" />
                        <span className="text-xs font-medium">
                          {formatFollowers(influencer.tiktok_followers)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg font-medium mb-2">{t("no_influencers")}</div>
          <div className="text-neutral-500 dark:text-neutral-400 mb-4">
            {t("add_first_influencer")}
          </div>
          <Button className="bg-primary text-white" onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> {t("add_influencer")}
          </Button>
        </div>
      )}

      {/* Add Influencer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("add_influencer")}</DialogTitle>
            <DialogDescription>
              {t("add_influencer_description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="nickname" className="text-right text-sm font-medium">
                {t("nickname")}
              </label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                placeholder="influencer_name"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="bio" className="text-right text-sm font-medium">
                {t("bio")}
              </label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder={t("influencer_bio")}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="instagram" className="text-right text-sm font-medium">
                Instagram
              </label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="username"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tiktok" className="text-right text-sm font-medium">
                TikTok
              </label>
              <Input
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) => setFormData(prev => ({ ...prev, tiktok: e.target.value }))}
                placeholder="username"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setFormData({ nickname: "", bio: "", instagram: "", tiktok: "" });
            }}>
              {t("cancel")}
            </Button>
            <Button 
              className="bg-primary text-white"
              onClick={() => addInfluencer(formData)}
              disabled={!formData.nickname}
            >
              {t("add_influencer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
