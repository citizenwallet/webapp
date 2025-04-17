"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { otpFormSchema } from "./otp-form-schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Config } from "@citizenwallet/sdk";
import { useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface OtpFormProps {
  config: Config;
}

export default function OtpForm({ config }: OtpFormProps) {
  const [isSubmitting, startSubmission] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof otpFormSchema>) {
    toast({
      title: "Verifying login code...",
      description: "Please wait while we verify your login code.",
    });
    startSubmission(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });
  }

  const primaryColor = config.community.theme?.primary ?? "#000000";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormControl>
                <InputOTP
                  autoFocus
                  type="numeric"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern={REGEXP_ONLY_DIGITS}
                  maxLength={6}
                  required
                  onComplete={(value) => {
                    form.handleSubmit(onSubmit)();
                  }}
                  disabled={isSubmitting}
                  {...field}
                >
                  <InputOTPGroup className="gap-2 md:gap-3 justify-center">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-9 h-9 sm:w-12 sm:h-12 text-xl sm:text-2xl border rounded-md"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
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
          {isSubmitting ? "Verifying..." : "Verify Login Code"}
        </Button>
      </form>
    </Form>
  );
}
