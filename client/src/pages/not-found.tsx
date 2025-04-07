import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 dark:bg-black">
      <Card className="w-full max-w-md mx-4 bg-white dark:bg-neutral-900/30 border-neutral-200/50 dark:border-neutral-800/50">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">404 {t("not_found")}</h1>
          </div>

          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            {t("project_not_found_description")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
