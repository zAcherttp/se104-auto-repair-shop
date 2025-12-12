"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Login } from "@/app/actions/login";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type LoginFormData, LoginFormSchema } from "@/lib/form/definitions";
import { cn } from "@/lib/utils";
import SubmitButton from "./submit-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await Login(data);
    if (result.error) {
      toast.error(t("error"));
    } else {
      router.push("/reception");
      toast.success(t("success"));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="pb-4">
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("passwordPlaceholder")}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-primary/5"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span
                            className={`transition-all duration-300 ease-in-out ${
                              showPassword ? "opacity-0" : "opacity-100"
                            }`}
                          >
                            <Eye className="h-4 w-4" />
                          </span>
                          <span
                            className={`absolute transition-all duration-200 ease-in-out ${
                              showPassword ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            <EyeOff className="h-4 w-4" />
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {t("button")}
              </SubmitButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
