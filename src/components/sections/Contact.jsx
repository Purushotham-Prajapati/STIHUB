
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto -mt-10">
            <AnimatedCard className="text-center scale-90">
                <div className="min-h-[65vh] bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <div className="bg-gradient-to-br from-blue-400 to-cyan-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Handshake size={32} className="text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-6">Collaboration</h3>

                    <p className="text-blue-100 leading-relaxed text-lg">
                        In collaboration with <span className="font-semibold text-white">Dr. Rama Naidu Vignana Jyothi Institute of Rural Development (DRNVJIRD),</span><br></br>
                        Thuniki village, Medak, Telangana.
                    </p>
                </div>
            </AnimatedCard>

            <AnimatedCard delay={200} className="text-center scale-90">
                <div className="min-h-[65vh] bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Mail size={32} className="text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-6">Contact Us</h3>

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

export default Contact;
