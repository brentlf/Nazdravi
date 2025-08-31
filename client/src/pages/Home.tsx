import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/common/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Full Viewport Hero Section with Background Image */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/OrangesBG.jpg)`,
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Header overlay - positioned at top */}
        <div className="relative z-20 w-full">
          {/* Header content will be handled by the Header component */}
        </div>

        {/* Main content left-aligned in viewport */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              {/* Main title "nazdravi" in elegant serif */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight text-white font-serif">
                nazdravi
              </h1>
              
              {/* Subtitle "Registered Dietitian" */}
              <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-white font-light tracking-wide opacity-90">
                Registered Dietitian
              </p>
              
              {/* BOOK AN APPOINTMENT button */}
              <Link href="/appointment">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 hover:border-white/60 hover:scale-105"
                >
                  BOOK AN APPOINTMENT
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer overlay - positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <Footer overlay={true} />
        </div>
      </section>
    </div>
  );
}

