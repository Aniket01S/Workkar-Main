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
      <section className="relative pt-24 pb-24 lg:pt-32 lg:pb-36 overflow-hidden flex items-center min-h-[680px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-left w-full">
          {/* Verified workers pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#0d142b]/60 backdrop-blur-md border border-white/5 rounded-full px-4 py-2 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            <span className="text-sm font-semibold text-slate-300">Verified workers available near you</span>
          </motion.div>

          {/* Text reveal animation for hero */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display-lg text-6xl md:text-[90px] text-on-surface mb-6 leading-[1] font-extrabold tracking-tight"
          >
            Hire skilled<br />hands<br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-400 to-orange-300 text-transparent bg-clip-text">in minutes.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-10 leading-relaxed"
          >
            Pick a service, compare workers and book the one you trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className="max-w-2xl"
          >
            <div className="flex bg-[#0a0f1d]/80 backdrop-blur-md border border-white/10 rounded-full p-2 pl-6 items-center shadow-lg transition-all focus-within:border-blue-500/50">
              <input
                type="text"
                placeholder="Search a service: leak, wiring, paint..."
                className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* Services Bento Grid Section */}
      <section className="py-8 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {services.map((service) => (
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
              <span className="material-symbols-outlined notranslate text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Workers Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display-lg text-4xl text-white mb-2 font-extrabold tracking-tight">Featured Workers</h2>
              <p className="text-lg text-slate-400">
                Top-rated, background-verified professionals ready to work immediately.
              </p>
            </div>
            <button
              onClick={() => navigate('/workers')}
              className="hidden sm:flex items-center gap-2 bg-[#0d142b]/60 backdrop-blur-md text-white border border-white/5 hover:bg-[#152042] px-6 py-3 rounded-full font-bold text-sm transition-all duration-200"
            >
              All Workers
              <span className="material-symbols-outlined notranslate text-[18px]">chevron_right</span>
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
      <section className="py-20 bg-transparent border-t border-white/5 mt-12">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-display-lg text-4xl text-white mb-2 font-extrabold tracking-tight">How It Works</h2>
            <p className="text-lg text-slate-400 max-w-sm mx-auto">
              Four simple steps to get your trade tasks completed safely and efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Horizontal line connector in desktop */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-white/5 z-0"></div>
            
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
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-extrabold mb-6 shadow-[0_0_20px_rgba(37,99,235,0.5)] border-4 border-[#0a0f1d] group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <h3 className="text-xl text-white mb-2 font-bold">{step.title}</h3>
                <p className="text-sm text-slate-400 px-4">{step.desc}</p>
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
