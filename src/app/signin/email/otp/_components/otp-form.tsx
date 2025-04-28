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
import { CommunityConfig, Config, waitForTxSuccess } from "@citizenwallet/sdk";
import { useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useSession } from "@/state/session/action";
import { submitOtpFormAction } from "@/app/signin/email/otp/actions";

interface OtpFormProps {
  config: Config;
}

export default function OtpForm({ config }: OtpFormProps) {
  const [isSubmitting, startSubmission] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const communityConfig = new CommunityConfig(config);

  const [sessionState, sessionActions] = useSession(config);

  const form = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      code: "",
      sessionRequestHash: sessionState((state) => state.hash) ?? "",
      privateKey: sessionState((state) => state.privateKey) ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof otpFormSchema>) {
    startSubmission(async () => {
      try {
        const result = await submitOtpFormAction({
          formData: values,
          config,
        });

        const successReceipt = await waitForTxSuccess(
          communityConfig,
          result.sessionRequestTxHash,
        );

        if (!successReceipt) {
          throw new Error("Failed to confirm transaction");
        }

        const accountAddress = await sessionActions.getAccountAddress();

        if (!accountAddress) {
          throw new Error("Failed to create account");
        }

        router.replace(`/${accountAddress}`);
      } catch (error) {
        if (error instanceof Error) {
          // Handle validation error
          if (error.message === "Invalid form data") {
            form.setError("code", {
              type: "validation",
              message: "Please enter a valid 6-digit code",
            });
            return;
          }

          if (error.message.includes("Failed to confirm transaction")) {
            toast({
              variant: "destructive",
              title: "Transaction Failed",
              description:
                "The verification transaction failed. Please try again.",
            });
            return;
          }

          // Handle HTTP errors
          if (error.message.includes("HTTP error")) {
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: "Invalid login code. Please try again.",
            });
            return;
          }

          if (error.message.includes("Failed to create account")) {
            toast({
              variant: "destructive",
              title: "Account Creation Failed",
              description: "Failed to create account. Please try again.",
            });
            return;
          }

          // Handle any other errors
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        } else {
          // Handle unknown errors
          toast({
            variant: "destructive",
            title: "Error",
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
