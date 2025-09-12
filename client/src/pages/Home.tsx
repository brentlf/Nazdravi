import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Target, Smile, Stethoscope, Leaf, Users, Clock, Shield, CheckCircle, ArrowRight, Crown, Star, Calendar, MessageCircle, FileText, Award, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: "ABOUT NAZDRAVI", href: "#about" },
    { name: "SERVICES", href: "#services" },
    { name: "PLANS", href: "#plans" },
    { name: "BLOG", href: "/blog" },
    { name: "BOOK APPOINTMENT", href: "/appointment" },
    { name: "MY ACCOUNT", href: "/login" },
  ];

  // Services data
  const services = [
    {
      icon: Heart,
      title: "Personalized Nutrition",
      description: "Tailored meal plans designed specifically for your health goals and dietary preferences",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Target,
      title: "Weight Management",
      description: "Sustainable strategies for achieving and maintaining your ideal weight",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Smile,
      title: "Mental Health Support",
      description: "Nutritional approaches to support mood, energy, and overall mental wellbeing",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Stethoscope,
      title: "Medical Nutrition",
      description: "Specialized nutrition therapy for diabetes, heart disease, and other conditions",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Leaf,
      title: "Plant-Based Nutrition",
      description: "Expert guidance for vegetarian, vegan, and plant-forward eating patterns",
      color: "from-lime-500 to-green-500"
    },
    {
      icon: Users,
      title: "Family Nutrition",
      description: "Comprehensive nutrition support for the whole family, from children to seniors",
      color: "from-purple-500 to-indigo-500"
    }
  ];

  // Plans data
  const plans = [
    {
      id: "initial",
      icon: Calendar,
      title: "Initial Consultation",
      description: "Comprehensive assessment and personalised nutrition strategy",
      duration: "60 minutes",
      price: "€95",
      features: [
        "Detailed health history review",
        "Current eating habits analysis",
        "Personalised nutrition plan",
        "Goal setting & recommendations"
      ],
      color: "from-emerald-500 to-teal-500",
      popular: false,
    },
    {
      id: "followup",
      icon: MessageCircle,
      title: "Follow-up Sessions",
      description: "Ongoing support and plan adjustments",
      duration: "30 minutes",
      price: "€40",
      features: [
        "Progress review and accountability",
        "Adjustments to nutrition plan",
        "Motivation and practical tips"
      ],
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "program",
      icon: Crown,
      title: "Complete Programme",
      description: "Comprehensive 3-month transformation journey",
      duration: "3 months",
      price: "€300",
      features: [
        "Initial consultation (60 min) + 5 follow-up sessions (30 min each)",
        "Weekly support",
        "Messaging support for questions and accountability",
        "Progress tracking tools"
      ],
      color: "from-purple-500 to-pink-500",
      popular: true,
    },
  ];

  return (
    <div className="single-page-scroll">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Background Video */}
        <video 
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: `translateZ(0) translateY(${scrollY * 0.5}px)`,
            WebkitTransform: `translateZ(0) translateY(${scrollY * 0.5}px)`,
          }}
        >
          <source src="/banana.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Fallback background image */}
        <div 
          className="hero-fallback-bg"
          style={{
            backgroundImage: "url('/oranges-tree.jpg')",
          }}
        />
        
        {/* Overlay */}
        <div className="hero-overlay" />
        
        {/* Mobile burger menu */}
        <div className="mobile-menu">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="menu-button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[82vw] max-w-[360px]">
              <nav className="mt-6 space-y-2">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                    <div className="px-4 py-4 rounded-lg text-lg font-medium cursor-pointer text-foreground hover:bg-muted/80">
                      {item.name}
                    </div>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Hero Content - Matching front1.png layout */}
        <div 
          className="hero-content"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        >
          {/* Main Title - Updated */}
          <div className="main-title-container">
            <div className="title-line-1">NAZDRAVI</div>
                     <div className="title-line-2">
                       <div>NUTRITION</div>
                       <div>PRACTICE</div>
                     </div>
            <div className="title-tagline">
              <div className="credentials-line-1">REGISTERED DIETITIAN</div>
              <div className="credentials-line-2">UK AND SA</div>
              <div className="credentials-line-3">
                <span className="credentials-profession">NUTRITION CONSULTANT</span>
                <span className="credentials-location"> NETHERLANDS</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right side navigation */}
        <div className="hero-navigation">
          <nav className="nav-vertical">
            {navigation.map((item, index) => (
              <a key={item.href} href={item.href} className="nav-item">
                <div className="nav-number">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="nav-text">
                  {item.name}
                </div>
              </a>
            ))}
          </nav>
        </div>

        {/* Social media icons */}
        <div className="social-icons">
          <a href="#" className="social-icon">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" className="social-icon">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" className="social-icon">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
          </a>
          <a href="#" className="social-icon">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </section>

      {/* About Section - Matching scrolling second page.png */}
      <section id="about" className="about-section">
        <div className="about-content-wrapper">
          <div className="about-number">01</div>
          <div className="about-title-container">
            <div className="about-title-line-1">CREATIVE NUTRITION</div>
            <div className="about-title-line-2">CONSULTATION &</div>
            <div className="about-title-line-3">HEALTH</div>
          </div>
          <div className="about-description">
            WE ARE OFFERING A MULTI DISCIPLINARY APPROACH AND NUTRITION SOLUTIONS IN PERSONAL AND COMPANY HEALTH CONSULTATION
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-content">
          <div className="section-number">02</div>
          <h2 className="section-title">OUR SERVICES</h2>
          <p className="section-description">
            Transform your health with evidence-based nutrition guidance tailored to your unique needs and lifestyle.
          </p>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className={`service-icon ${service.color}`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="plans-section">
        <div className="section-content">
          <div className="section-number">03</div>
          <h2 className="section-title">CHOOSE YOUR PLAN</h2>
          <p className="section-description">
            Select the nutrition plan that best fits your lifestyle and goals. Both options provide expert guidance tailored to your unique needs.
          </p>
          
          <div className="plans-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <div className={`plan-icon ${plan.color}`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="plan-title">{plan.title}</h3>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-details">
                  <span className="plan-duration">Duration: {plan.duration}</span>
                  <span className="plan-price">{plan.price}</span>
                </div>
                <ul className="plan-features">
                  {plan.features.slice(0, 3).map((feature, featureIndex) => (
                    <li key={featureIndex} className="plan-feature">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="plan-button">
                  {plan.id === "program" ? "Start Program" : "Book Now"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="contact-section">
        <div className="section-content">
          <div className="section-number">04</div>
          <h2 className="section-title">READY TO START YOUR JOURNEY?</h2>
          <p className="section-description">
            Take the first step towards better health with a personalised nutrition consultation.
          </p>
          <div className="contact-buttons">
            <Link href="/appointment">
              <Button size="lg" className="contact-button primary">
                Book Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="contact-button secondary">
                My Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}