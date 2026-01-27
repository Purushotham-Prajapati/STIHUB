
import React from 'react';
import { Award } from 'lucide-react';
import Section from '../common/Section';
// import { projectStats } from '../../constants/data';
// import AnimatedCard from '../ui/AnimatedCard';

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

export default Hero;
