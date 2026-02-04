
import React from 'react';
import { Award } from 'lucide-react';
import Section from '../common/Section';
// import { projectStats } from '../../constants/data';
// import AnimatedCard from '../ui/AnimatedCard';
import dstHero from '../../assets/dst-hero.png';
import vnrpng from '../../assets/vnr-logo.png';
const Hero = () => (
  <Section id="home" className=" py-20 lg:pt-24 lg:pb-3 md:pb-52 pt-28 pb-52 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12 scale-150"></div>
    </div>

    <div className="relative z-10 text-center width-[100vw] ">
      <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6  border border-white/20">
        <Award className="text-yellow-400" size={20} />
        <span className="text-sm font-medium">Funded by Vigyan Dhara, DST</span>
      </div>

      <h1 className="text-3xl md:text-2xl xl:text-4xl font-bold tracking-tight mb-6 md:mb-2 leading-tight block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        Science Technology and Innovation Hub
      </h1>

      <p className="text-xl md:text-lg xl:text-xl   font-light text-blue-100 max-w-full mx-auto mb-6 md:mb-2  leading-relaxed">
        Empowering Scheduled Tribe Communities through Science Technology & Innovation in Kowdipally Block, Medak District, Telangana
      </p>
      <div className='absolute lg:bottom-12 -bottom-52 lg:flex lg:flex-row lg:justify-between w-full flex gap-2 flex-col items-center'>
        <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg'><img src={dstHero} alt=" DST" className='md:h-16 xl:h-18 h-16 ' /></div>
        <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg'><img src={vnrpng} alt=" VNRVJIET" className='md:h-16 xl:h-18 h-16' /></div>
      </div>
    </div>
  </Section>
);

export default Hero;
