import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreActions } from "@/hooks/useFirestore";
import { useLanguage } from "@/contexts/LanguageContext";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { add, loading } = useFirestoreActions("newsletter_subscribers");
  const { t } = useLanguage();

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      await add(data);
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing. Check your email for the free meal planning guide!",
      });
    } catch (error: any) {
      if (error.code === "permission-denied" || error.message.includes("unique")) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "default",
        });
      } else {
        toast({
          title: "Subscription failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl">
        <Gift className="h-12 w-12 text-white mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Thank you!</h3>
        <p className="text-white/90">
          Check your email for the free meal planning guide.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("email-placeholder", "home")}
                      className="bg-white border-0 text-gray-900 placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-white/90" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold"
            >
              {loading ? (
                "Subscribing..."
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t("subscribe", "home")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Free Resource Incentive */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Gift className="w-6 h-6 text-white" />
          <h3 className="text-lg font-semibold text-white">{t("free-bonus", "home")}</h3>
        </div>
        <p className="text-white/90 text-sm text-center">
          {t("meal-planning-guide", "home")}
        </p>
      </div>

      <p className="text-white/80 text-sm mt-4 text-center">
        {t("privacy-notice", "home")}
      </p>
    </div>
  );
}
