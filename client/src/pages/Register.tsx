import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Leaf, AlertCircle, X, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signUp, signInWithGoogle, user } = useAuth();
  const { actualTheme } = useTheme();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null); // Clear any previous errors
    setSuccess(null); // Clear any previous success messages
    try {
      await signUp(data.email, data.password, data.name);
      setSuccess("Your account has been created successfully.");
    } catch (error: any) {
      setError(error.message || "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || "Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="h-full relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/oranges-sky.jpg)`,
          imageRendering: 'crisp-edges',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)'
        }}
      />
      
      {/* Light overlay for better text readability while maintaining image clarity */}
      <div className="absolute inset-0 bg-black/25 sm:bg-black/15" />
      
      {/* Navigation Header */}
      <div className="relative z-20 w-full">
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 flex items-center gap-3 sm:gap-4 px-safe pt-safe">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-all duration-300 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="absolute top-4 sm:top-6 right-4 sm:right-8 flex items-center gap-2 px-safe pt-safe">
          <ThemeToggle className="text-white hover:bg-white/20" />
        </div>
      </div>

      <div className="relative z-10 h-full flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 px-safe pb-safe">
        <div className="max-w-md w-full space-y-10">
          {/* Sophisticated Header */}
          <div className="text-center space-y-6 animate-in fade-in-0 slide-in-from-top-4 duration-700 delay-200">
            <Link href="/">
              <div className="flex items-center justify-center space-x-3 cursor-pointer group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-white/30">
                  <Leaf className="h-7 w-7 text-white" />
                </div>
                <span className="font-bold text-3xl text-white tracking-tight drop-shadow-lg" style={{fontFamily: 'DM Sans, sans-serif'}}>
                  Nazdravi
                </span>
              </div>
            </Link>
            <div className="text-center">
              <h1 className="text-4xl font-light text-white mb-3 drop-shadow-lg" style={{fontFamily: 'DM Sans, sans-serif'}}>
                Join our community
              </h1>
              <p className="text-white/90 text-lg font-light leading-relaxed drop-shadow-md" style={{fontFamily: 'DM Sans, sans-serif'}}>
                Start your wellness journey with Nazdravi
              </p>
            </div>
          </div>

          <Card className={`${actualTheme === 'dark' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700`}>
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className={`text-2xl font-semibold text-center ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{fontFamily: 'Playfair Display, serif'}}>
                Create your account
              </CardTitle>
              <CardDescription className={`text-center ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{fontFamily: 'DM Sans, sans-serif'}}>
                Begin your personalized wellness journey
              </CardDescription>
            </CardHeader>
            
            {/* Inline Error Notification */}
            {error && (
              <div className="mx-8 mb-6">
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg backdrop-blur-sm">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200" style={{fontFamily: 'DM Sans, sans-serif'}}>
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
                  >
                    <X className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Inline Success Notification */}
            {success && (
              <div className="mx-8 mb-6">
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg backdrop-blur-sm">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200" style={{fontFamily: 'DM Sans, sans-serif'}}>
                      {success}
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccess(null)}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
                  >
                    <X className="h-4 w-4 text-green-500 dark:text-green-400" />
                  </button>
                </div>
              </div>
            )}
            
            <CardContent className="space-y-6 px-8 pb-8">
              {/* Google Sign Up */}
              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border border-green-200 hover:border-green-300 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                onClick={handleGoogleSignUp}
                disabled={loading}
                style={{fontFamily: 'DM Sans, sans-serif'}}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full opacity-60" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground font-medium" style={{fontFamily: 'DM Sans, sans-serif'}}>
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Registration Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={`text-sm font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{fontFamily: 'DM Sans, sans-serif'}}>
                          Full name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
                            <Input
                              {...field}
                              placeholder="Enter your full name"
                              className="pl-10 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                              style={{fontFamily: 'DM Sans, sans-serif'}}
                              onChange={(e) => {
                                field.onChange(e);
                                if (error) setError(null);
                                if (success) setSuccess(null);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={`text-sm font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{fontFamily: 'DM Sans, sans-serif'}}>
                          Email address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                              style={{fontFamily: 'DM Sans, sans-serif'}}
                              onChange={(e) => {
                                field.onChange(e);
                                if (error) setError(null);
                                if (success) setSuccess(null);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={`text-sm font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{fontFamily: 'DM Sans, sans-serif'}}>
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="pl-10 pr-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                              style={{fontFamily: 'DM Sans, sans-serif'}}
                              onChange={(e) => {
                                field.onChange(e);
                                if (error) setError(null);
                                if (success) setSuccess(null);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground/70" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground/70" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={`text-sm font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{fontFamily: 'DM Sans, sans-serif'}}>
                          Confirm password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="pl-10 pr-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                              style={{fontFamily: 'DM Sans, sans-serif'}}
                              onChange={(e) => {
                                field.onChange(e);
                                if (error) setError(null);
                                if (success) setSuccess(null);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground/70" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground/70" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:scale-[1.01] hover:shadow-md mt-8" 
                    disabled={loading}
                    style={{fontFamily: 'DM Sans, sans-serif'}}
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>

              {/* Terms and Privacy */}
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed mt-6" style={{fontFamily: 'DM Sans, sans-serif'}}>
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
              <div className="text-center text-gray-600 dark:text-gray-300" style={{fontFamily: 'DM Sans, sans-serif'}}>
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors">
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
