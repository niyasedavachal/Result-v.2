
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MarketingConfig } from '../types';
import { LandingNavbar, HeroSection, FeaturesSection, PricingSection } from './landing/LandingSections';

// --- TYPEWRITER COMPONENT ---
const TypewriterText: React.FC = () => {
    const words = ["Results", "Fees", "Exams", "Students", "Certificates"];
    const [text, setText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [speed, setSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                setText(currentWord.substring(0, text.length - 1));
                setSpeed(50);
            } else {
                setText(currentWord.substring(0, text.length + 1));
                setSpeed(150);
            }

            if (!isDeleting && text === currentWord) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setWordIndex((prev) => (prev + 1) % words.length);
            }
        };

        const timer = setTimeout(handleType, speed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, wordIndex, speed]);

    return (
        <span className="text-blue-600 dark:text-blue-400 font-black">
            {text}
            <span className="animate-pulse text-slate-400">|</span>
        </span>
    );
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mktConfig, setMktConfig] = useState<MarketingConfig | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(12);

  useEffect(() => {
      const loadConfig = async () => {
          const cfg = await api.getMarketingConfig();
          setMktConfig(cfg);
          if (cfg?.smartPlanSeatsLeft) setSpotsLeft(cfg.smartPlanSeatsLeft);
      };
      loadConfig();
  }, []);

  useEffect(() => {
      if (!mktConfig?.flashSaleEndTime) return;
      const interval = setInterval(() => {
          const now = new Date().getTime();
          const target = new Date(mktConfig.flashSaleEndTime!).getTime();
          const dist = target - now;
          if (dist < 0) {
              setTimeLeft('00:00:00');
              clearInterval(interval);
          } else {
              const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
              const s = Math.floor((dist % (1000 * 60)) / 1000);
              setTimeLeft(`${h}h ${m}m ${s}s`);
          }
      }, 1000);
      return () => clearInterval(interval);
  }, [mktConfig]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar & Urgency */}
      <LandingNavbar 
          mktConfig={mktConfig} 
          timeLeft={timeLeft} 
          spotsLeft={spotsLeft} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* Hero */}
      <HeroSection mktConfig={mktConfig} Typewriter={TypewriterText} />

      {/* Features */}
      <FeaturesSection />

      {/* Pricing */}
      <PricingSection mktConfig={mktConfig} />

      {/* Final CTA */}
      <section className="py-20 px-4 bg-slate-900 text-center">
          <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-6">Ready to upgrade?</h2>
              <p className="text-slate-400 mb-8">Join the fastest growing education network in Kerala. Setup takes 60 seconds.</p>
              <button 
                onClick={() => navigate('/setup')}
                className="bg-white text-slate-900 px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 mx-auto"
              >
                  <RocketIcon className="w-5 h-5"/> Get Started for Free
              </button>
          </div>
      </section>

    </div>
  );
};

const RocketIcon = ({className}:{className?:string}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.1 4-1 4-1"/><path d="M12 15v5s3.03-.55 4-2c1.1-1.62 1-4 1-4"/></svg>
);

export default Landing;
