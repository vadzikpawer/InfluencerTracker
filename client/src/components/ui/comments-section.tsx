import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Paperclip } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type User = {
  id: number;
  name: string;
  role: string;
};

interface Comment {
  id: number;
  content: string;
  createdAt: string | Date;
  userId: number;
  user?: User;
}

interface CommentsProps {
  projectId: number;
  comments: Comment[];
  className?: string;
}

export function Comments({ projectId, comments, className }: CommentsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formatDate = (date: Date | string) => {
    if (typeof date === "string") {
      date = new Date(date);
    }
    return format(date, "dd.MM.yyyy, HH:mm", { locale: ru });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/projects/${projectId}/comments`, {
        content: newComment
      });
      
      // Invalidate comments query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/comments`] });
      
      setNewComment("");
      toast({
        title: t("comment_added"),
        description: t("comment_added_success"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("comment_add_failed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-bold font-sf-pro mb-3">{t("comments")}</h3>
      
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex">
            <Avatar className="w-8 h-8 mr-3 flex-shrink-0 bg-neutral-200 dark:bg-neutral-800">
              <div className="flex items-center justify-center text-xs font-medium">
                {comment.user ? getInitials(comment.user.name) : "??"}
              </div>
            </Avatar>
            
            <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-3 flex-grow">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">
                  {comment.user?.name || t("unknown_user")}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-4">
            {t("no_comments")}
          </div>
        )}
      </div>
      
      {user && (
        <div className="flex">
          <Avatar className="w-8 h-8 mr-3 flex-shrink-0 bg-neutral-200 dark:bg-neutral-800">
            <div className="flex items-center justify-center text-xs font-medium">
              {getInitials(user.name)}
            </div>
          </Avatar>
          
          <div className="flex-grow">
            <Textarea
              placeholder={t("write_comment")}
              className="w-full p-3 mb-2 resize-none"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            
            <div className="flex justify-between">
              <Button variant="link" className="text-primary text-sm p-0">
                <Paperclip className="h-4 w-4 mr-1" />
                {t("attach")}
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-primary text-white"
              >
                {t("send")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
