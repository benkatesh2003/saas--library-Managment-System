import React, { useState } from 'react';
import { Navbar } from '../../components/landing/Navbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { LiveSeatGridDemo } from '../../components/landing/LiveSeatGridDemo';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { RoiCalculator } from '../../components/landing/RoiCalculator';
import { PricingSection } from '../../components/landing/PricingSection';
import { TestimonialsSection } from '../../components/landing/TestimonialsSection';
import { FaqSection } from '../../components/landing/FaqSection';
import { BookDemoModal } from '../../components/landing/BookDemoModal';
import { Footer } from '../../components/landing/Footer';

export function HomePage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onOpenDemoModal={() => setIsDemoModalOpen(true)} />
      <main className="flex-1">
        <HeroSection onOpenDemoModal={() => setIsDemoModalOpen(true)} />
        <LiveSeatGridDemo />
        <FeaturesSection />
        <RoiCalculator onOpenDemoModal={() => setIsDemoModalOpen(true)} />
        <PricingSection onOpenDemoModal={() => setIsDemoModalOpen(true)} />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
      <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}
