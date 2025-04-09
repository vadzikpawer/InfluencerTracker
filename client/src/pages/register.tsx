import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const registerSchema = z.object({
    username: z.string().min(1, {
      message: t("username_required"),
    }),
    password: z.string().min(6, {
      message: t("password_min_length_error"),
    }),
    name: z.string().min(1, {
      message: t("name_required"),
    }),
    role: z.enum(["manager", "influencer"], {
      required_error: t("role_required"),
    }),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: undefined,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(values.username, values.password, values.name, values.role);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-black px-4">
      <Card className="w-full max-w-md bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
        <CardHeader className="text-center">
          <div className="text-primary text-2xl font-bold font-sf-pro mb-2">{t("app_name")}</div>
          <CardTitle className="text-xl">{t("register")}</CardTitle>
          <CardDescription>{t("register_description")}</CardDescription>
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
                        placeholder={t("create_username")} 
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
                        placeholder={t("password_min_length")} 
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("full_name")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t("enter_full_name")} 
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("role")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50">
                          <SelectValue placeholder={t("select_role")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manager">{t("manager")}</SelectItem>
                        <SelectItem value="influencer">{t("influencer")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? t("registering") : t("register")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="w-full pt-4 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t("already_have_account")}
            </p>
            <Link href="/login">
              <a className="inline-block w-full mt-2">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  {t("sign_in")}
                </Button>
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 