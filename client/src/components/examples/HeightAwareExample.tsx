import React from 'react';

/**
 * Example component demonstrating height-aware responsive design
 * This shows how to use the new height-based utilities and breakpoints
 */
export const HeightAwareExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Full viewport hero section that adapts to height */}
      <section className="hero-responsive h-short-hero landscape-compact">
        <div className="flex-1-height flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="h-short-heading landscape-hide text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
              Height-Aware Design
            </h1>
            <p className="h-short-text landscape-adjust text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              This hero section adapts to different screen heights, providing optimal viewing experience
              on everything from iPhone SE to large desktop monitors.
            </p>
          </div>
        </div>
      </section>

      {/* Flexible dashboard layout example */}
      <div className="flex-height-safe min-h-screen">
        {/* Navigation that adapts to screen height */}
        <header className="nav-responsive bg-card border-b border-border">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <nav className="hidden md:flex space-x-4">
              <a href="#" className="hover:text-primary">Home</a>
              <a href="#" className="hover:text-primary">About</a>
              <a href="#" className="hover:text-primary">Contact</a>
            </nav>
            {/* Mobile menu button - hidden in landscape on short screens */}
            <button className="md:hidden landscape-hide p-2 hover:bg-muted rounded">
              Menu
            </button>
          </div>
        </header>

        {/* Main content area that scrolls */}
        <main className="flex-1-height overflow-y-auto bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            {/* Content grid that adapts to width and height */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-3">Card 1</h3>
                <p className="text-muted-foreground">
                  This card adapts to different screen sizes and heights.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-3">Card 2</h3>
                <p className="text-muted-foreground">
                  Content scales appropriately for short and tall screens.
                </p>
              </div>

              {/* Card 3 - hidden on very short screens */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-xs:hidden">
                <h3 className="text-xl font-semibold mb-3">Card 3</h3>
                <p className="text-muted-foreground">
                  This card is hidden on very short screens to save space.
                </p>
              </div>
            </div>

            {/* Responsive text section */}
            <section className="mt-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 h-short-heading">
                Responsive Typography
              </h2>
              <div className="prose max-w-none">
                <p className="text-lg sm:text-xl h-short-text landscape-adjust">
                  This text adapts to screen height using our custom utilities. On short screens,
                  it becomes more compact. On landscape phones, it adjusts spacing. On tall screens,
                  it uses generous spacing for better readability.
                </p>
              </div>
            </section>

            {/* Modal example */}
            <div className="mt-8">
              <button 
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                onClick={() => {
                  // In a real app, this would open a modal
                  alert('This would open a height-responsive modal');
                }}
              >
                Open Modal
              </button>
            </div>
          </div>
        </main>

        {/* Footer that adapts to available space */}
        <footer className="footer-responsive bg-card border-t border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2024 VeeNutrition. All rights reserved.
              </p>
              <div className="flex space-x-4 mt-2 sm:mt-0">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Example of height-responsive modal (would be conditionally rendered) */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 hidden">
        <div className="modal-responsive bg-card rounded-lg shadow-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Height-Responsive Modal</h3>
            <p className="text-muted-foreground mb-6">
              This modal adapts to available viewport height, ensuring it never exceeds
              90% of the screen height and provides scrolling when needed.
            </p>
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeightAwareExample;
