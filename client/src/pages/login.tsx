import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Имя пользователя обязательно",
  }),
  password: z.string().min(1, {
    message: "Пароль обязателен",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.username, values.password);
    } catch (error) {
      toast({
        title: t("login_failed"),
        description: t("invalid_credentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-black px-4">
      <Card className="w-full max-w-md bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
        <CardHeader className="text-center">
          <div className="text-primary text-2xl font-bold font-sf-pro mb-2">InfluencerPro</div>
          <CardTitle className="text-xl">{t("login")}</CardTitle>
          <CardDescription>{t("login_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("username")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t("enter_username")} 
                        disabled={isLoading} 
                        className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={t("enter_password")} 
                        disabled={isLoading} 
                        className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary text-white" 
                disabled={isLoading}
              >
                {isLoading ? t("logging_in") : t("sign_in")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            <p>{t("demo_credentials")}:</p>
            <p className="mt-1">
              <strong>{t("manager")}:</strong> manager / password
            </p>
            <p>
              <strong>{t("influencer")}:</strong> influencer1 / password
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
