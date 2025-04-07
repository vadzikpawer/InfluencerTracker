import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type StepStatus = "completed" | "current" | "pending";

interface ProgressStepProps {
  label: string;
  status: StepStatus;
}

interface ProgressStepsProps {
  steps: ProgressStepProps[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  const { t } = useTranslation();
  
  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return "bg-secondary";
      case "current":
        return "bg-primary";
      case "pending":
        return "bg-neutral-200 dark:bg-neutral-800";
    }
  };

  return (
    <div className={cn("flex space-x-2", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className={cn("w-full h-1 rounded-full mb-1", getStatusColor(step.status))} />
          <span className="text-xs text-neutral-700 dark:text-neutral-300">{t(step.label)}</span>
        </div>
      ))}
    </div>
  );
}
