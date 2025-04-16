"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { emailFormSchema } from "./email-form-schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Config } from "@citizenwallet/sdk";
import { useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";

interface EmailFormProps {
  config: Config;
}

export default function EmailForm({ config }: EmailFormProps) {
  const [isSubmitting, startSubmission] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof emailFormSchema>) {
    startSubmission(async () => {
      try {
        // TODO: submit email form
      } catch (error) {
        console.error("Form submission error:", error);

        // Handle specific error types
        if (error instanceof Error) {
          if (error.message === "Invalid form data") {
            form.setError("email", {
              type: "validation",
              message: "Please enter a valid email address",
            });
            return;
          }

          toast({
            variant: "destructive",
            description: error.message,
          });
        } else {
          toast({
            variant: "destructive",
            description: "An unexpected error occurred. Please try again.",
          });
        }
      }
    });
  }

  const primaryColor = config.community.theme?.primary ?? "#000000";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="username email"
                    autoFocus
                    required
                    className="pl-10 h-12" // Increased left padding to accommodate larger icon
                    aria-describedby="email-description"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription id="email-description">
                You will receive a login code to this email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? "Sending..." : "Continue with Email"}
        </Button>
      </form>
    </Form>
  );
}
