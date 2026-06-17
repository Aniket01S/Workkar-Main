import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import WorkerCard from '../components/WorkerCard';
import { ServiceModal } from '../components/Modals';

export default function Home() {
  const navigate = useNavigate();
  const { services, workers } = useWorkkar();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  // Search submit - Navigates to /workers with search query parameters
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/workers?${params.toString()}`);
  };

  // Filter only featured/verified top workers for landing page
  const featuredWorkers = workers.filter(w => w.verified && w.rating >= 4.8).slice(0, 3);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-28 lg:pb-36 overflow-hidden flex items-center justify-center min-h-[680px] bg-[#f8f9ff]">
        <div className="absolute inset-0 z-0">
          <img
            alt="Construction worker on site"
            className="w-full h-full object-cover opacity-10"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7GmKwfTkIdksNV1G09M8Z1Tq_0SDgKb5Tj3F2C1GXkfhv3uURMveJiyxkeutE7gmXec7um4b66hwVPk33nuI6cAJrWrRaJEYTuSuk-sJpt1U4yfIdiK5KGYaVZPYWOKQcnZn1KeoUPK07YJ283cOlhGBEfGc6WRnl3AL5g8t-L84St5Y7k_mPQbE1Bm4zIHezEPxeJnudVEsWrZIH6ZhnpcKcPDV7motgt_1rpfbz-bOL-7igHPRM0ynVUHidgnPBW70zKnzkFPPy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/80 to-surface"></div>
        </div>
        
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          {/* Text reveal animation for hero */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display-lg text-4xl md:text-display-lg text-on-surface mb-stack-md max-w-4xl mx-auto leading-tight font-extrabold tracking-tight"
          >
            Find Trusted Skilled <br />
            <span className="text-primary bg-clip-text">Workers Near You</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-stack-lg leading-relaxed"
          >
            Book verified electricians, plumbers, masons, painters, carpenters, and other daily-wage workers instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          >
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              onSearch={handleSearch}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-stack-sm mt-stack-md"
          >
            <button
              onClick={() => navigate('/workers')}
              className="w-full sm:w-auto bg-primary text-on-primary px-8 py-4 rounded-full font-title-md text-title-md shadow-md hover:shadow-lg hover:bg-primary/95 transition-all duration-200 active:scale-95 font-bold"
            >
              Hire a Worker
            </button>
            <button
              onClick={() => navigate('/worker/dashboard')}
              className="w-full sm:w-auto bg-surface-container text-primary px-8 py-4 rounded-full font-title-md text-title-md border border-primary/20 hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 active:scale-95 font-bold"
            >
              Register as a Worker
            </button>
          </motion.div>
        </div>
      </section>

      {/* Services Bento Grid Section */}
      <section className="py-20 bg-surface-container-low border-y border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-bold">Our Services</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
              Expert daily wage workers for every home maintenance and industrial need.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-stack-md"
          >
            {services.slice(0, 4).map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <ServiceCard
                  service={service}
                  onClick={() => setSelectedService(service)}
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/services')}
              className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center justify-center mx-auto gap-1 active:scale-95 transition-transform"
            >
              View All Services
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Workers Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-bold">Featured Workers</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Top-rated, background-verified professionals ready to work immediately.
              </p>
            </div>
            <button
              onClick={() => navigate('/workers')}
              className="hidden sm:flex items-center gap-1 text-primary font-bold hover:underline font-label-md text-label-md active:scale-95 transition-transform"
            >
              All Workers
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md"
          >
            {featuredWorkers.map((worker) => (
              <motion.div key={worker.id} variants={itemVariants}>
                <WorkerCard worker={worker} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-bold">How It Works</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
              Four simple steps to get your trade tasks completed safely and efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Horizontal line connector in desktop */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-outline-variant/30 z-0"></div>
            
            {[
              { num: 1, title: "Search", desc: "Find workers by skill and location." },
              { num: 2, title: "View Profile", desc: "Check ratings and experience." },
              { num: 3, title: "Book", desc: "Instantly book your chosen worker." },
              { num: 4, title: "Get Work Done", desc: "Pay securely after completion." }
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md font-bold mb-4 shadow-md border-4 border-surface-container-lowest">
                  {step.num}
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-2 font-bold">{step.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <ServiceModal
        service={selectedService}
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}
