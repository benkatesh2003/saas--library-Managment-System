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
  const [selectedPlanForDemo, setSelectedPlanForDemo] = useState(null);

  const handleOpenGeneralDemo = () => {
    setSelectedPlanForDemo(null);
    setIsDemoModalOpen(true);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlanForDemo(plan);
    setIsDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onOpenDemoModal={handleOpenGeneralDemo} />
      <main className="flex-1">
        <HeroSection onOpenDemoModal={handleOpenGeneralDemo} />
        <LiveSeatGridDemo />
        <FeaturesSection />
        <RoiCalculator onOpenDemoModal={handleOpenGeneralDemo} />
        <PricingSection
          onOpenDemoModal={handleOpenGeneralDemo}
          onSelectPlan={handleSelectPlan}
        />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
      <BookDemoModal
        isOpen={isDemoModalOpen}
        selectedPlan={selectedPlanForDemo}
        onClose={() => {
          setIsDemoModalOpen(false);
          setSelectedPlanForDemo(null);
        }}
      />
    </div>
  );
}
