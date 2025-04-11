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
import { Link, useLocation } from "wouter";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const loginSchema = z.object({
    username: z.string().min(1, {
      message: t("username_required"),
    }),
    password: z.string().min(1, {
      message: t("password_required"),
    }),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.getValues('username'), form.getValues('password'));
      setLocation('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-black px-4">
      <Card className="w-full max-w-md bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
        <CardHeader className="text-center">
          <div className="text-primary text-2xl font-bold font-sf-pro mb-2">{t("app_name")}</div>
          <CardTitle className="text-xl">{t("login")}</CardTitle>
          <CardDescription>{t("login_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
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
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? t("logging_in") : t("sign_in")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            <p>{t("demo_credentials")}</p>
            <p className="mt-1">
              <strong>{t("manager")}:</strong> manager / password
            </p>
            <p>
              <strong>{t("influencer")}:</strong> influencer1 / password
            </p>
          </div>
          <div className="w-full pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t("dont_have_account")}
            </p>
            <Link href="/register">
              <a className="inline-block w-full mt-2">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  {t("register")}
                </Button>
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
