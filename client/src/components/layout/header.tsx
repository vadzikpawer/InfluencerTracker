import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface Tab {
  id: string;
  label: string;
  href: string;
  roles: string[];
}

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const tabs: Tab[] = [
    { id: "dashboard", label: t("dashboard"), href: "/", roles: ["manager", "influencer"] },
    { id: "projects", label: t("projects"), href: "/projects", roles: ["manager", "influencer"] },
    { id: "influencers", label: t("influencers"), href: "/influencers", roles: ["manager"] },
    { id: "reports", label: t("reports"), href: "/reports", roles: ["manager"] },
  ];

  const visibleTabs = tabs.filter(tab => 
    user && tab.roles.includes(user.role)
  );

  const isActiveTab = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-black shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-primary text-lg font-bold font-sf-pro">InfluencerPro</div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {!isMobile && (
                <div className="mr-2 text-sm font-medium">{user.name}</div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-8 h-8 cursor-pointer bg-neutral-200 dark:bg-neutral-800">
                    <div className="flex items-center justify-center text-xs font-medium">
                      {user.name ? getInitials(user.name) : "U"}
                    </div>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t("profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">{t("settings")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
      
      {user && (
        <div className="bg-white dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {visibleTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="link"
                  asChild
                  className={`px-4 py-3 font-medium text-sm rounded-none ${
                    isActiveTab(tab.href)
                      ? "text-primary border-b-2 border-primary"
                      : "text-neutral-600/60 dark:text-neutral-400/60 border-b-2 border-transparent"
                  }`}
                >
                  <Link href={tab.href}>{tab.label}</Link>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
