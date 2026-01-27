
import React from 'react';
import { Handshake, Mail, MapPin, Building } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';

const Contact = () => (
    <Section id="contact" className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <SectionTitle subtitle="">
            <p className='text-5xl text-cyan-500'>Get In Touch</p>
            <p className='text-white text-2xl mt-4'>Connect with us to learn more about our initiatives and collaborations</p>
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto -mt-6">
            <AnimatedCard className="text-center h-full">
                <div className="h-full bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg">
                    <div className="bg-gradient-to-br from-blue-400 to-cyan-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                        <Handshake size={28} className="text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-white">Collaboration</h3>

                    <p className="text-blue-50 leading-relaxed text-lg">
                        In collaboration with <span className="font-semibold text-white">Dr. Rama Naidu Vignana Jyothi Institute of Rural Development (DRNVJIRD),</span><br></br>
                        Thuniki village, Medak, Telangana.
                    </p>
                </div>
            </AnimatedCard>

            <AnimatedCard delay={200} className="text-center h-full">
                <div className="h-full bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                        <Mail size={28} className="text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-white">Contact Us</h3>

                    <div className="space-y-4 text-left px-4">
                        <div className="flex items-start space-x-3">
                            <Building className="text-blue-300 flex-shrink-0 mt-1" size={20} />
                            <p className="text-blue-50">VNR Vignana Jyothi Institute of Engineering and Technology, Hyderabad</p>
                        </div>

                        <div className="flex items-start space-x-3">
                            <MapPin className="text-green-300 flex-shrink-0 mt-1" size={20} />
                            <p className="text-blue-50">Science & Technology Innovation (STI) Hub</p>
                        </div>
                    </div>

                    <a
                        href="mailto:dststihubvnr@gmail.com"
                        className="inline-flex items-center space-x-2 mt-8 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    >
                        <Mail size={18} />
                        <span>dststihubvnr@gmail.com</span>
                    </a>
                </div>
            </AnimatedCard>
        </div>
    </Section>
);

export default Contact;
