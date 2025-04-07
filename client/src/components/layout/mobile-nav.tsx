import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Home, FolderOpen, Users, BarChart3, Plus } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      id: "dashboard",
      icon: <Home className="h-5 w-5" />,
      label: t("dashboard"),
      href: "/",
      roles: ["manager", "influencer"],
    },
    {
      id: "projects",
      icon: <FolderOpen className="h-5 w-5" />,
      label: t("projects"),
      href: "/projects",
      roles: ["manager", "influencer"],
    },
    {
      id: "add",
      icon: <Plus className="h-6 w-6" />,
      label: "",
      href: "/projects/new",
      roles: ["manager"],
      isAction: true,
    },
    {
      id: "influencers",
      icon: <Users className="h-5 w-5" />,
      label: t("influencers"),
      href: "/influencers",
      roles: ["manager"],
    },
    {
      id: "reports",
      icon: <BarChart3 className="h-5 w-5" />,
      label: t("reports"),
      href: "/reports",
      roles: ["manager"],
    },
  ].filter((item) => item.roles.includes(user.role));

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 h-16 flex md:hidden z-10">
      {navItems.map((item) =>
        item.isAction ? (
          <Link
            key={item.id}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center text-center relative"
          >
            <div className="absolute -top-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center">
              {item.icon}
            </div>
          </Link>
        ) : (
          <Link
            key={item.id}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center text-center ${
              isActive(item.href)
                ? "text-primary"
                : "text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        )
      )}
    </div>
  );
}
