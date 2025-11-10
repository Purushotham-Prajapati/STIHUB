import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, User, Mail, Building, FileText, Handshake, Phone, Menu, X, ArrowRight, Calendar, MapPin, Award, Users, Target, Lightbulb,
  Linkedin, Instagram, Twitter, Globe
} from 'lucide-react';

// Import your images from the assets folder
import dstLogo from './assets/dst.jpg';
import vnrLogo from './assets/vnr1.jpg';
import pareaImg from './assets/parea.jpg';


// Gallery Images
import gallery1 from './assets/gallery-1.jpg';
import gallery2 from './assets/gallery-2.jpg';
import gallery3 from './assets/gallery-3.jpg';
import gallery4 from './assets/gallery-4.jpg';
import gallery5 from './assets/team.jpeg';
import gallery6 from './assets/core.jpeg';

// Community Engagement Icons
import communityIcon from './assets/community.png';
import educationIcon from './assets/education.png';
import skillBasedIcon from './assets/skillBased.png';
import innovationIcon from './assets/innovation.png';

// Livelihood Capitals Images
import img1 from './assets/img1.jpg';
import img2 from './assets/img2.jpg';
import img3 from './assets/img3.jpg';
import img4 from './assets/img4.jpg';

// --- Data ---
const navLinks = [
  { name: 'Home', href: '#home', icon: Building },
  { name: 'About', href: '#about', icon: FileText },
  { name: 'Outcomes', href: '#outcomes', icon: Target },
  { name: 'Team', href: '#team', icon: Users },
  { name: 'Contact', href: '#contact', icon: Mail },
];

const galleryImages = [gallery1, gallery5, gallery6, gallery2, gallery3, gallery4];

const engagementOutcomes = [
  { 
    icon: communityIcon, 
    title: 'Community Facility Centre', 
    description: 'Empowering the village through collaboration', 
    bgGradient: 'from-blue-500 to-purple-600',
    stats: '5+ Centers'
  },
  { 
    icon: educationIcon, 
    title: 'Awareness Programs', 
    description: 'Fostering knowledge and participation', 
    bgGradient: 'from-green-500 to-teal-600',
    stats: '200+ Participants'
  },
  { 
    icon: skillBasedIcon, 
    title: 'Skill Based Training', 
    description: 'Building capacity for sustainable growth', 
    bgGradient: 'from-red-500 to-pink-600',
    stats: '150+ Trained'
  },
  { 
    icon: innovationIcon, 
    title: 'Technology Interventions', 
    description: 'Integrating innovation with tradition', 
    bgGradient: 'from-orange-500 to-yellow-600',
    stats: '10+ Technologies'
  },
];

const livelihoodCapitals = [
  { image: img1, title: 'Backyard Poultry', description: 'Sustainable poultry farming for rural communities' },
  { image: img2, title: 'Feed and Fodder', description: 'Quality nutrition for livestock development' },
  { image: img3, title: 'Honey Bee Farming', description: 'Sweet success through bee cultivation' },
  { image: img4, title: 'TKS - Seed Bank', description: 'Preserving traditional knowledge and seeds' },
];

const teamMembers = {
  pi: { name: 'Dr. Alapati Mallika', role: 'Professor, Dept. of Civil Engineering, VNRVJIET', avatar: '👩‍🔬' },
  coInvestigators: [
    { name: 'Dr. Padmavathi Papolu', role: 'Assistant Professor, Chemistry, VNRVJIET', avatar: '👩‍🔬' },
    { name: 'Dr. K Anuradha', role: 'Professor of EEE, VNRVJIET', avatar: '👩‍🔬' },
    { name: 'Dr. Myneni Madhu Bala', role: 'Professor of CSE, VNRVJIET', avatar: '👩‍🔬' },
    { name: 'Dr. B. Ashok', role: 'Sr. Assistant Professor of Physics, VNRVJIET', avatar: '👨‍🔬' },
    { name: 'Dr. B. Prathyusha', role: 'Assistant Professor of MBA, VNRVJIET', avatar: '👩‍🔬' },
    { name: 'Dr. K Madhavi', role: 'Assistant Professor, Chemistry, VNRVJIET', avatar: '👩‍🔬' },
    { name: 'Mr. K. Veerendra Gopi', role: 'Assistant Professor, CE, VNRVJIET', avatar: '👨‍🔬' },
    { name: 'Mr. R. Ramu', role: 'Assistant Professor, AE, VNRVJIET', avatar: '👨‍🔬' },
    { name: 'Dr. D. Ramesh Reddy', role: 'Assistant Professor, ECE, VNRVJIET', avatar: '👨‍🔬' },
    { name: 'Mr. D. Mahesh', role: 'DRNVJIRD (Collaborative Institution)', avatar: '👨‍🔬' },
    { name: 'Ms. P. Keerthi', role: 'DRNVJIRD (Collaborative Institution)', avatar: '👩‍🔬' },
  ],
};

const newsItems = [
  { 
    title: 'Recruitment Notification for Project Staff (Adv No. DST-STI H/01)', 
    date: 'Oct 26, 2023', 
    href: 'adv-man-power.pdf',
    category: 'Recruitment',
    excerpt: 'New positions available for project staff members.',
    link:'https://drive.google.com/file/d/1jX9uzYPBke7T8fNhIlMM4xA3RnHaSBec/view?usp=sharing',
    target:'_blank'
  },
  { 
    title: 'Launch of Science, Technology, and Innovation Hub', 
    date: 'Sep 15, 2023', 
    href: '#',
    category: 'Launch',
    excerpt: 'Official inauguration of the STI Hub project.',
    link:'#team',
    target:''
  },
  { 
    title: 'Community Outreach in Kowdipally Block', 
    date: 'Nov 05, 2023', 
    href: '#',
    category: 'Outreach',
    excerpt: 'Successful community engagement program completed.',
    link:'#team',
    target:''
  },
];

const projectStats = [
  { label: 'Project Cost', value: '₹86.8 Lakhs', icon: Award },
  { label: 'Duration', value: '3 Years', icon: Calendar },
  { label: 'Communities', value: '15+', icon: Users },
  { label: 'Technologies', value: '10+', icon: Lightbulb },
];

// --- Reusable Components ---
const Section = ({ id, children, className = '' }) => (
  <section id={id} className={`py-6 ${className}`}>
    <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-4">
      {children}
    </h2>
    {subtitle && (
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
    )}
  </div>
);

const AnimatedCard = ({ children, className = '', delay = 0 }) => (
  <div 
    className={`transform transition-all duration-700 hover:scale-102 ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// --- App Components ---
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed  top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg py-2' 
        : 'bg-white/80 backdrop-blur-md py-4'
    }`}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <a href='https://vnrvjiet.ac.in/' target='_blank'><img src={vnrLogo} alt="VNRVJIET Logo" className="h-12 w-auto object-contain ml-2 rounded-lg shadow-sm" /></a>
          <div className="flex flex-col -m-r-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              STI HUB
            </h1>
            <p className="hidden lg:block text-xs text-gray-600 max-w-xs leading-tight">
              SEED, DST – VNR Vignana Jyothi Institute of Engineering and Technology
            </p>
          </div>
          <img src={dstLogo} alt="DST Logo" className=" -ml-2 h-12 w-12 object-contain rounded-lg shadow-sm" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium group"
            >
              <link.icon size={18} className="group-hover:scale-110 transition-transform" />
              <span>{link.name}</span>
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl lg:hidden">
            <nav className="p-6 space-y-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.name}</span>
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const Hero = () => (
  <Section id="home" className=" py-20 md:py-32 pt-32 pb-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12 scale-150"></div>
    </div>
    
    <div className="relative z-10 text-center max-w-6xl mx-auto">
      <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
        <Award className="text-yellow-400" size={20} />
        <span className="text-sm font-medium">Funded by Vigyan Dhara, DST</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        Science, Technology, and
        <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Innovation Hub
        </span>
      </h1>
      
      <p className="text-xl md:text-2xl font-light text-blue-100 max-w-4xl mx-auto mb-6  leading-relaxed">
        Empowering Scheduled Tribe Communities through Science, Technology & Innovation in 
        <span className="font-semibold text-white"> Kowdipally Block, Medak District, Telangana</span>
      </p>

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
        {projectStats.map((stat, index) => (
          <AnimatedCard key={index} delay={index * 100} className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <stat.icon className="mx-auto mb-3 text-yellow-400" size={32} />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-blue-200">{stat.label}</div>
            </div>
          </AnimatedCard>
        ))}
      </div> */}
    </div>
  </Section>
);

const Gallery = () => {
  const [current, setCurrent] = useState(0);

  const prevSlide = useCallback(() => {
    setCurrent(current === 0 ? galleryImages.length - 1 : current - 1);
  }, [current]);

  const nextSlide = useCallback(() => {
    setCurrent(current === galleryImages.length - 1 ? 0 : current + 1);
  }, [current]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 6000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <Section className="bg-gray-50 py-10 md:py-16">
      <SectionTitle subtitle="Capturing moments from our community engagement and project activities">
        Photo Gallery
      </SectionTitle>
      
      <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-3xl shadow-2xl group bg-white p-2">
        <div
          className="flex transition-transform ease-out duration-700"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {galleryImages.map((img, i) => (
            <div key={i} className="w-full flex-shrink-0 relative">
              <img 
                src={img} 
                alt={`Gallery item ${i + 1}`} 
                className="w-full h-[500px] object-cover rounded-2xl" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
            </div>
          ))}
        </div>
        
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>
        
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center justify-center gap-3">
            {galleryImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  current === i 
                    ? 'w-12 h-3 bg-white' 
                    : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

const AboutProject = () => (
  <Section id="about">
    <SectionTitle subtitle="Transforming lives through science and technology interventions">
      About The Project
    </SectionTitle>
    
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
      <div className="xl:col-span-2 space-y-8">
        <AnimatedCard className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-3xl shadow-xl border border-blue-100">
          <div className="flex items-start space-x-4 mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <Target className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Project Title</h3>
              <p className="text-blue-600 text-sm font-medium mb-4">DST/SEED/TSP/STI/2023/956 (G)</p>
            </div>
          </div>
          
          <p className=" font-semibold text-blue-700 leading-relaxed text-lg mb-8">
            Science Technology and Innovation Hub for Development of Scheduled Tribe Community in tribal areas of 
            <span className="font-semibold text-blue-700"> Kowdipally Block, Medak District, Telangana State</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
              <div className="flex items-center space-x-3 mb-3">
                <Award className="text-green-600" size={24} />
                <h4 className="text-xl font-bold text-gray-800">Project Cost</h4>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹86.8 Lakhs
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="text-purple-600" size={24} />
                <h4 className="text-xl font-bold text-gray-800">Duration</h4>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                3 Years
              </p>
            </div>
          </div>
        </AnimatedCard>
        <div></div>
        <AnimatedCard delay={200} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-[85vw] mb-6" >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
            <MapPin className="text-red-500" size={28} />
            <span>Project Objectives</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Establish community-based technology centers</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Enhance livelihood opportunities through skill development</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Promote sustainable agricultural practices</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Foster innovation and technology adoption</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
      
      <div className="xl:col-span-1">
        <AnimatedCard delay={100} className="sticky top-24">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center space-x-2">
              <MapPin className="text-red-500" size={24} />
              <span>Project Area</span>
            </h3>
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <img
                src={pareaImg}
                alt="Map of the project area in Medak District"
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-semibold text-lg">Kowdipally Block</p>
                <p className="text-sm opacity-90">Medak District, Telangana</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  </Section>
);

const CommunityEngagement = () => (
  <Section id="outcomes" className="bg-gradient-to-br from-gray-50 to-blue-50">
    <SectionTitle subtitle="Measuring our impact through comprehensive community engagement initiatives ">
      Community Engagement Outcomes
    </SectionTitle>
    
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      {engagementOutcomes.map((item, index) => (
        <AnimatedCard key={index} delay={index * 150} className="group">
          <div className={`relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${item.bgGradient} px-6 py-2 pt-3 text-white min-h-[300px] flex flex-col justify-between transform group-hover:-translate-y-2`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-white transform rotate-12 scale-150 -translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-6 inline-block group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={item.icon} 
                  alt={`${item.title} icon`}
                  className="w-20 h-20 object-contain mx-auto filter brightness-0 invert"
                />
              </div>
              
              <h3 className="text-xl font-bold mb-3 leading-tight">{item.title}</h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">{item.description}</p>
            </div>
            
            {/* <div className="relative z-10 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <p className="text-2xl font-bold">{item.stats}</p>
                <p className="text-white/80 text-sm">Achievement</p>
              </div>
            </div> */}
          </div>
        </AnimatedCard>
      ))}
    </div>
  </Section>
);

const LivelihoodCapitals = () => (
  <Section>
    <SectionTitle subtitle="Sustainable livelihood solutions tailored for rural communities">
      Livelihood Capitals
    </SectionTitle>
    
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      {livelihoodCapitals.map((item, index) => (
        <AnimatedCard key={index} delay={index * 100} className="group">
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform group-hover:-translate-y-3">
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="p-8 text-center">
              <h4 className="font-bold text-xl text-gray-800 mb-3">{item.title}</h4>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
              
              <div className="mt-6">
                <button className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium group-hover:translate-x-1 transition-all duration-300">
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </AnimatedCard>
      ))}
    </div>
  </Section>
);

const Team = () => (
  <Section id="team" className="bg-gradient-to-br from-indigo-50 to-purple-50">
    <SectionTitle subtitle="Meet the dedicated professionals driving innovation and change">
      Our Team
    </SectionTitle>
    
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Principal Investigator */}
      <AnimatedCard className="bg-white rounded-3xl shadow-xl p-10 py-5 mb-6 border border-indigo-100">
        <div className="text-center mb-6 scale-90">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {teamMembers.pi.avatar}
          </div>
          <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            Principal Investigator
          </span>
        </div>
        
        <div className="text-center scale-90">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{teamMembers.pi.name}</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{teamMembers.pi.role}</p>
        </div>
      </AnimatedCard>

      {/* Co-Investigators */}
      <AnimatedCard delay={200} className="bg-white rounded-3xl shadow-xl p-10 py-5 mb-4 border border-indigo-100">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Co-Investigators
          </h3>
          <p className="text-gray-600">Collaborative expertise across multiple disciplines</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teamMembers.coInvestigators.map((member, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-indigo-50 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1 leading-tight">{member.name}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  </Section>
);

const News = () => (
  <Section className="bg-gray-50 my-8">
    <SectionTitle subtitle="Stay updated with our latest developments and announcements">
      News & Reports
    </SectionTitle>
    
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsItems.map((item, index) => (
          <AnimatedCard key={index} delay={index * 100} className="group">
            <article className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform group-hover:-translate-y-2">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar size={14} className="mr-1" />
                    {item.date}
                  </div>
                </div>
                
                <a href={item.link} target={item.target} className='hover:underline'><h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3></a>
                
                <p className="text-gray-600 mb-6 leading-relaxed">{item.excerpt}</p>
                
                <a 
                  href={item.href}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium group-hover:translate-x-1 transition-all duration-300"
                >
                  <FileText size={16} />
                  <a href={item.link} target={item.target}>Read More</a>
                  <ArrowRight size={16} />
                </a>
              </div>
            </article>
          </AnimatedCard>
        ))}
      </div>
    </div>
  </Section>
);

const Contact = () => (
  <Section id="contact" className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
    <SectionTitle subtitle="">
      <p className='text-5xl text-cyan-500'>Get In Touch</p>
      <p className='text-white text-2xl mt-4'>Connect with us to learn more about our initiatives and collaborations</p>
    </SectionTitle>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto -mt-10">
      <AnimatedCard className="text-center scale-90">
        <div className="min-h-[65vh] bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="bg-gradient-to-br from-blue-400 to-cyan-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Handshake size={32} className="text-white" />
          </div>
          
          <h3 className="text-2xl font-bold mb-6">Collaboration</h3>
          
          {/* <div className="bg-white/5 rounded-2xl p-6 mb-6">
            <img src={collaborationIcon} alt="Collaboration" className="h-24 mx-auto mb-4 opacity-90"/>
          </div> */}
          
          <p className="text-blue-100 leading-relaxed text-lg">
            In collaboration with <span className="font-semibold text-white">Dr. Rama Naidu Vignana Jyothi Institute of Rural Development (DRNVJIRD),</span><br></br> 
            Thuniki village, Medak, Telangana.
          </p>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={200} className="text-center  scale-90">
        <div className=" min-h-[65vh] bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="bg-gradient-to-br from-green-400 to-emerald-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Mail size={32} className="text-white" />
          </div>
          
          <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
          
            {/* <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <img src={mailIcon} alt="Contact" className="h-20 mx-auto mb-4 opacity-90"/>
            </div> */}
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <Building className="text-blue-300 flex-shrink-0" size={20} />
              <p className="text-blue-100">VNR Vignana Jyothi Institute of Engineering and Technology, Hyderabad</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="text-green-300 flex-shrink-0" size={20} />
              <p className="text-blue-100">Science & Technology Innovation (STI) Hub</p>
            </div>
          </div>
          
          <a 
            href="mailto:dststihubvnr@gmail.com" 
            className="inline-flex items-center space-x-3 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Mail size={20} />
            <span>dststihubvnr@gmail.com</span>
          </a>
        </div>
      </AnimatedCard>
    </div>
  </Section>
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <img src={dstLogo} alt="DST Logo" className="h-10 w-10 object-contain rounded-lg" />
            <h3 className="text-xl font-bold text-white">STI HUB</h3>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Empowering communities through science, technology, and innovation initiatives.
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {navLinks.slice(0, 4).map((link) => (
              <li key={link.name}>
                <a href={link.href} className="hover:text-white transition-colors flex items-center space-x-2">
                  <link.icon size={16} />
                  <span>{link.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        
                <div>
          <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-blue-400 flex-shrink-0" />
              <span className="text-sm">Medchal District, Telangana</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-blue-400 flex-shrink-0" />
              <span className="text-sm">dststihubvnr@gmail.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Building size={16} className="text-blue-400 flex-shrink-0" />
              <span className="text-sm">VNRVJIET, Hyderabad</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-8 text-center">
        <p className="text-gray-400 mb-4">
          &copy; {new Date().getFullYear()} STI Hub, VNRVJIET. All Rights Reserved. | 
          <span className="text-blue-400 ml-1">Funded by Vigyan Dhara, DST, Government of India</span>
        </p>
        <SocialMediaLinks />
      </div>
    </div>
  </footer>
);

// Social Media Links
const SocialMediaLinks = () => (
  <div className="flex items-center justify-center space-x-4 mt-4">
    <a 
      href="https://www.linkedin.com/school/vnrvjiethyd/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-blue-500 transition-colors"
      aria-label="LinkedIn"
    >
      <Linkedin size={20} />
    </a>
    <a 
      href="https://www.instagram.com/vnrvjiet.hyd/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-pink-500 transition-colors"
      aria-label="Instagram"
    >
      <Instagram size={20} />
    </a>
    <a 
      href="https://x.com/vnrvjiethyd" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-blue-400 transition-colors"
      aria-label="Twitter"
    >
      <Twitter size={20} />
    </a>
    <a 
      href="https://vnrvjiet.ac.in/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-purple-500 transition-colors"
      aria-label="VNRVJIET Website"
    >
      <Globe size={20} />
    </a>
  </div>
);

// Scroll to Top Button Component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 group"
          aria-label="Scroll to top"
        >
          <ChevronLeft className="rotate-90 group-hover:-translate-y-1 transition-transform" size={24} />
        </button>
      )}
    </>
  );
};

// Loading Component
const Loading = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
    <div className="text-center text-white">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
      </div>
      <h2 className="text-2xl font-bold mb-2">STI HUB</h2>
      <p className="text-blue-200">Loading...</p>
    </div>
  </div>
);

// Enhanced App Component with Loading State
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Add custom scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #2563eb, #7c3aed);
      }
      
      /* Smooth scroll behavior */
      html {
        scroll-behavior: smooth;
      }
      
      /* Animation keyframes */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      /* Apply animations to cards */
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-slideInLeft {
        animation: slideInLeft 0.6s ease-out forwards;
      }
      
      .animate-slideInRight {
        animation: slideInRight 0.6s ease-out forwards;
      }
      
      /* Intersection Observer animations */
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
      }
      
      .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, [isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-white font-sans text-gray-700 overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Gallery />
        <AboutProject />
        <CommunityEngagement />
        <LivelihoodCapitals />
        <Team />
        <News />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;