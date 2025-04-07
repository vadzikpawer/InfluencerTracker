import { cn } from "@/lib/utils";
import { FaInstagram, FaTiktok, FaYoutube, FaTelegram, FaVk } from "react-icons/fa";

type SocialPlatform = "instagram" | "tiktok" | "youtube" | "telegram" | "vk";

interface SocialIconProps {
  platform: SocialPlatform;
  className?: string;
  size?: "sm" | "md" | "lg";
  showBg?: boolean;
}

export function SocialIcon({ platform, className, size = "md", showBg = true }: SocialIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };
  
  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  
  const getIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "instagram": return FaInstagram;
      case "tiktok": return FaTiktok;
      case "youtube": return FaYoutube;
      case "telegram": return FaTelegram;
      case "vk": return FaVk;
      default: return FaInstagram;
    }
  };
  
  const Icon = getIcon(platform);

  if (showBg) {
    return (
      <div 
        className={cn(
          "rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center",
          sizeClasses[size],
          className
        )}
      >
        <Icon className={iconSizes[size]} />
      </div>
    );
  }
  
  return <Icon className={cn(className)} />;
}
