import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { SocialIcon } from "@/components/ui/social-icon";
import { Search, Plus, UserPlus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Influencers() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { data: influencers, isLoading } = useQuery({
    queryKey: ["/api/influencers"],
  });

  const filteredInfluencers = influencers?.filter(influencer => {
    // Filter by search term
    const matchesSearch = 
      influencer.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (influencer.bio && influencer.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by platform
    const matchesPlatform = 
      platformFilter === "all" || 
      (platformFilter === "instagram" && influencer.instagramHandle) ||
      (platformFilter === "tiktok" && influencer.tiktokHandle) ||
      (platformFilter === "youtube" && influencer.youtubeHandle) ||
      (platformFilter === "telegram" && influencer.telegramHandle) ||
      (platformFilter === "vk" && influencer.vkHandle);
    
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
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="vk">ВКонтакте</SelectItem>
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
                  <div className="text-lg font-medium">
                    {influencer.nickname.substring(0, 2).toUpperCase()}
                  </div>
                </Avatar>
                
                <div>
                  <h3 className="font-bold mb-1">{influencer.nickname}</h3>
                  <p className="text-sm text-neutral-700/70 dark:text-neutral-300/70 mb-3 line-clamp-2">
                    {influencer.bio || t("no_bio")}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {influencer.instagramHandle && (
                      <div className="flex items-center" title="Instagram">
                        <SocialIcon platform="instagram" size="sm" className="mr-1.5" />
                        <span className="text-xs font-medium">
                          {formatFollowers(influencer.instagramFollowers)}
                        </span>
                      </div>
                    )}
                    
                    {influencer.tiktokHandle && (
                      <div className="flex items-center" title="TikTok">
                        <SocialIcon platform="tiktok" size="sm" className="mr-1.5" />
                        <span className="text-xs font-medium">
                          {formatFollowers(influencer.tiktokFollowers)}
                        </span>
                      </div>
                    )}
                    
                    {influencer.youtubeHandle && (
                      <div className="flex items-center" title="YouTube">
                        <SocialIcon platform="youtube" size="sm" className="mr-1.5" />
                        <span className="text-xs font-medium">
                          {formatFollowers(influencer.youtubeFollowers)}
                        </span>
                      </div>
                    )}
                    
                    {influencer.telegramHandle && (
                      <div className="flex items-center" title="Telegram">
                        <SocialIcon platform="telegram" size="sm" className="mr-1.5" />
                        <span className="text-xs font-medium">
                          {formatFollowers(influencer.telegramFollowers)}
                        </span>
                      </div>
                    )}
                    
                    {influencer.vkHandle && (
                      <div className="flex items-center" title="ВКонтакте">
                        <SocialIcon platform="vk" size="sm" className="mr-1.5" />
                        <span className="text-xs font-medium">
                          {formatFollowers(influencer.vkFollowers)}
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
                placeholder="username"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button className="bg-primary text-white">
              {t("add_influencer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
