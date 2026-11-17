
import React from 'react';
import { Handshake, Mail, MapPin, Building } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';

const Contact = () => (
    <Section id="contact" className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-12">
        <div className="max-w-6xl mx-auto">
            <AnimatedCard>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        {/* Title & Description Column - 2/5 width */}
                        <div className="lg:col-span-2 p-8 bg-black/20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
                            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-3">Get In Touch</h2>
                            <p className="text-blue-100 text-base leading-relaxed mb-6">Connect with us to learn more about our initiatives and collaborations</p>

                            <div className="bg-white/5 rounded-xl p-5 border border-white/10 mt-auto">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="bg-blue-500/20 p-2 rounded-lg">
                                        <Handshake size={20} className="text-blue-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Collaboration</h3>
                                </div>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    In collaboration with <span className="font-semibold text-white">Dr. Rama Naidu Vignana Jyothi Institute of Rural Development (DRNVJIRD),</span><br />
                                    Thuniki village, Medak, Telangana.
                                </p>
                            </div>
                        </div>

                        {/* Contact Details Column - 3/5 width */}
                        <div className="lg:col-span-3 p-8 flex flex-col justify-center">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-green-500/20 p-2 rounded-lg">
                                    <Mail size={24} className="text-green-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Contact Us</h3>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <Building className="text-blue-300 flex-shrink-0 mt-1" size={20} />
                                    <p className="text-blue-50 text-base">VNR Vignana Jyothi Institute of Engineering and Technology, Hyderabad</p>
                                </div>

                                <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <MapPin className="text-green-300 flex-shrink-0 mt-1" size={20} />
                                    <p className="text-blue-50 text-base">Science & Technology Innovation (STI) Hub</p>
                                </div>
                            </div>

                            <a
                                href="mailto:dststihubvnr@gmail.com"
                                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg w-full sm:w-auto self-start"
                            >
                                <Mail size={18} />
                                <span>dststihubvnr@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            </AnimatedCard>
        </div>
    </Section>
);

export default Contact;
